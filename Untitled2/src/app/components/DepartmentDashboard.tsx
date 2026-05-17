import { useState, useEffect } from 'react';
import { LogOut, Download, FileSpreadsheet, Users, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { DepartmentAdmin } from './DepartmentAuth';
import { ApplicationSubmission, getApplicationsByDepartment, getDepartmentStats } from './ApplicationService';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

// دالة مساعدة لتحميل ExcelJS ديناميكياً (تدعم الألوان مجاناً)
const loadExcelJS = () => import('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js' as any).catch(() => null);

interface DepartmentDashboardProps {
  admin: DepartmentAdmin;
  onLogout: () => void;
}

export default function DepartmentDashboard({ admin, onLogout }: DepartmentDashboardProps) {
  const { t, dir } = useLanguage();
  const [applications, setApplications] = useState<ApplicationSubmission[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, [admin.departmentId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await getApplicationsByDepartment(admin.departmentId);
      setApplications(apps);

      const departmentStats = await getDepartmentStats(admin.departmentId);
      setStats(departmentStats);
    } catch (error) {
      console.error('خطأ في تحميل الطلبات:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── دالة مساعدة لبناء صف بيانات الطالب ─────────────────────
  const buildAppRow = (app: any) => {
    const statusLabel = app.status === 'pending' ? 'قيد المراجعة'
      : app.status === 'accepted' ? 'مقبول'
      : app.status === 'rejected' ? 'مرفوض' : 'تمت المراجعة';
    return {
      date: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('ar-DZ') : (app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('ar-DZ') : '-'),
      category: app.category || '-',
      regNum: app.registrationNumber || '-',
      firstName: app.firstName || (app.fullName?.split(' ')[0] ?? '-'),
      lastName: app.lastName || (app.fullName?.split(' ').slice(1).join(' ') ?? '-'),
      birthDate: app.birthDate || '-', birthPlace: app.birthPlace || '-',
      bacNumber: app.bacNumber || '-', bacYear: app.bacYear || '-',
      email: app.email || '-', phone: app.phone || '-',
      university: app.licenseUniversity || '-', specialization: app.licenseSpecialization || '-',
      s1: app.semester1 || app.semesters?.semester1 || '-',
      s2: app.semester2 || app.semesters?.semester2 || '-',
      s3: app.semester3 || app.semesters?.semester3 || '-',
      s4: app.semester4 || app.semesters?.semester4 || '-',
      s5: app.semester5 || app.semesters?.semester5 || '-',
      s6: app.semester6 || app.semesters?.semester6 || '-',
      y1: app.year1 || app.years?.year1 || '-', y2: app.year2 || app.years?.year2 || '-',
      y3: app.year3 || app.years?.year3 || '-', y4: app.year4 || app.years?.year4 || '-',
      y5: app.year5 || app.years?.year5 || '-',
      master: app.desiredMaster || app.preferences?.join(' | ') || '-',
      pdf1: app.uploadedFiles?.bacTranscript?.name || (typeof app.uploadedFiles?.bacTranscript === 'string' ? app.uploadedFiles.bacTranscript : '-'),
      pdf2: app.uploadedFiles?.licenseDocument?.name || (typeof app.uploadedFiles?.licenseDocument === 'string' ? app.uploadedFiles.licenseDocument : '-'),
      pdf3: app.uploadedFiles?.transcripts?.name || (typeof app.uploadedFiles?.transcripts === 'string' ? app.uploadedFiles.transcripts : '-'),
      status: statusLabel, notes: '',
      pdfData1: app.uploadedFiles?.bacTranscript?.data || null,
      pdfData2: app.uploadedFiles?.licenseDocument?.data || null,
      pdfData3: app.uploadedFiles?.transcripts?.data || null,
    };
  };

  // ── دالة تحميل Excel ملوّن باستخدام ExcelJS ─────────────────
  const downloadAsExcel = async () => {
    const ExcelJS = await new Promise<any>((resolve, reject) => {
      if ((window as any).ExcelJS) { resolve((window as any).ExcelJS); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
      script.onload = () => resolve((window as any).ExcelJS);
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(() => null);
    if (!ExcelJS) { alert('تعذّر تحميل مكتبة Excel. تحقق من الاتصال بالإنترنت.'); return; }
    const wb = new ExcelJS.Workbook();
    const today = new Date().toLocaleDateString('ar-DZ');
    const deptName = admin.departmentName;

    // ── ألوان ──
    const G_DARK='1A5E3A', G_MID='2E7D52', G_LIGHT='E8F5EE', GOLD='B8960C';
    const GRN_D='2E7D32', GRN_L='E8F5E9', RED_D='C62828', RED_L='FFEBEE';
    const ORG_D='E65100', ORG_L='FFF3E0', BLU_D='1565C0', BLU_L='E3F2FD';
    const PUR_D='6A1B9A', PUR_L='F3E5F5';

    const fl = (hex: string) => ({ type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF'+hex } });
    const fn = (hex='000000', sz=10, bold=false) => ({ name:'Calibri', size:sz, bold, color:{ argb:'FF'+hex } });
    const al = (h='center') => ({ horizontal:h as any, vertical:'middle' as any, readingOrder:2, wrapText:false });
    const bd = (c='CCCCCC') => ({ top:{style:'thin',color:{argb:'FF'+c}}, bottom:{style:'thin',color:{argb:'FF'+c}}, left:{style:'thin',color:{argb:'FF'+c}}, right:{style:'thin',color:{argb:'FF'+c}} });
    const mbd = (fg: string) => ({ top:{style:'thin',color:{argb:'FF'+fg}}, bottom:{style:'thin',color:{argb:'FF'+fg}}, left:{style:'medium',color:{argb:'FF'+fg}}, right:{style:'medium',color:{argb:'FF'+fg}} });

    // ══════════════════════════════════════════════════
    // ورقة 1 — قائمة الطلبات
    // ══════════════════════════════════════════════════
    const ws = wb.addWorksheet('قائمة الطلبات', { views:[{rightToLeft:true,state:'frozen',ySplit:8,xSplit:0}] });
    ws.properties.tabColor = { argb:'FF'+G_DARK };

    // أعمدة + عروضها
    const COLS = [
      {header:'#',key:'seq',width:4},{header:'تاريخ التسجيل',key:'date',width:16},{header:'الفئة',key:'category',width:20},
      {header:'رقم التسجيل',key:'regNum',width:14},{header:'الاسم',key:'firstName',width:13},{header:'اللقب',key:'lastName',width:13},
      {header:'ت.الميلاد',key:'birthDate',width:12},{header:'م.الميلاد',key:'birthPlace',width:13},
      {header:'رقم الباك',key:'bacNumber',width:13},{header:'سنة الباك',key:'bacYear',width:12},
      {header:'البريد الإلكتروني',key:'email',width:22},{header:'الهاتف',key:'phone',width:13},
      {header:'جامعة الليسانس',key:'university',width:19},{header:'تخصص الليسانس',key:'specialization',width:19},
      {header:'S1',key:'s1',width:7},{header:'S2',key:'s2',width:7},{header:'S3',key:'s3',width:7},
      {header:'S4',key:'s4',width:7},{header:'S5',key:'s5',width:7},{header:'S6',key:'s6',width:7},
      {header:'سنة1',key:'y1',width:8},{header:'سنة2',key:'y2',width:8},{header:'سنة3',key:'y3',width:8},
      {header:'سنة4',key:'y4',width:8},{header:'سنة5',key:'y5',width:8},
      {header:'تخصص الماستر',key:'master',width:22},
      {header:'كشف الباك PDF',key:'pdf1',width:14},{header:'شهادة الليسانس PDF',key:'pdf2',width:16},
      {header:'كشوف الليسانس PDF',key:'pdf3',width:16},
      {header:'الحالة',key:'status',width:14},{header:'ملاحظات',key:'notes',width:20},
    ];
    ws.columns = COLS;

    // ── صف 1: عنوان رئيسي ──
    ws.spliceRows(1,0,[]);
    const r1 = ws.getRow(1);
    r1.getCell(1).value = `🎓   ${deptName}  —  منصة ترشحات الماستر 2026  —  جامعة قاصدي مرباح ورقلة`;
    r1.getCell(1).font = fn('FFFFFF',16,true);
    r1.getCell(1).fill = fl(G_DARK);
    r1.getCell(1).alignment = al();
    ws.mergeCells(1,1,1,COLS.length);
    r1.height = 38;

    // ── صف 2: معلومات ──
    ws.spliceRows(2,0,[]);
    const r2 = ws.getRow(2);
    r2.getCell(1).value = `📅  ${today}  |  📋  قائمة الطلبات المقدمة للدراسة من قِبل رئيس القسم`;
    r2.getCell(1).font = fn('FFFFFF',10);
    r2.getCell(1).fill = fl(G_MID);
    r2.getCell(1).alignment = al('right');
    ws.mergeCells(2,1,2,COLS.length);
    r2.height = 20;

    // ── صف 3: خط ذهبي ──
    ws.spliceRows(3,0,[]);
    const r3 = ws.getRow(3);
    for(let c=1;c<=COLS.length;c++) r3.getCell(c).fill = fl(GOLD);
    r3.height = 5;

    // ── صفوف 4-6: بطاقات الإحصائيات ──
    const total = filteredApplications.length;
    const accepted = filteredApplications.filter((a:any)=>a.status==='accepted').length;
    const pending  = filteredApplications.filter((a:any)=>a.status==='pending').length;
    const rejected = filteredApplications.filter((a:any)=>a.status==='rejected').length;

    const cards = [
      {label:`👥 إجمالي الطلبات`, val:total,   fg:BLU_D, bg:BLU_L, cols:[1,8]},
      {label:`⏳ قيد المراجعة`,    val:pending,  fg:ORG_D, bg:ORG_L, cols:[9,16]},
      {label:`✅ مقبول`,            val:accepted, fg:GRN_D, bg:GRN_L, cols:[17,23]},
      {label:`❌ مرفوض`,            val:rejected, fg:RED_D, bg:RED_L, cols:[24,COLS.length]},
    ];
    for(const rn of [4,5,6]) { ws.spliceRows(rn,0,[]); ws.getRow(rn).height = rn===4?18:rn===5?32:5; }

    cards.forEach(({label,val,fg,bg,cols:[sc,ec]}) => {
      // صف العنوان
      const cr4 = ws.getRow(4).getCell(sc);
      cr4.value=label; cr4.font=fn(fg,9,true); cr4.fill=fl(bg); cr4.alignment=al(); cr4.border=mbd(fg) as any;
      ws.mergeCells(4,sc,4,ec);
      // صف الرقم
      const cr5 = ws.getRow(5).getCell(sc);
      cr5.value=val; cr5.font=fn(fg,22,true); cr5.fill=fl(bg); cr5.alignment=al(); cr5.border=mbd(fg) as any;
      ws.mergeCells(5,sc,5,ec);
      // خط ملون
      for(let c=sc;c<=ec;c++) { const cc=ws.getRow(6).getCell(c); cc.fill=fl(fg); cc.border=mbd(fg) as any; }
    });

    // ── صف 7: فارغ ──
    ws.spliceRows(7,0,[]); ws.getRow(7).height=6;

    // ── صف 8: رؤوس الجدول ──
    const headerRow = ws.getRow(8);
    COLS.forEach(({header},ci) => {
      const cell = headerRow.getCell(ci+1);
      cell.value=header; cell.font=fn('FFFFFF',9,true); cell.fill=fl(G_DARK);
      cell.alignment={...al(),wrapText:true};
      cell.border={ top:{style:'thin',color:{argb:'FF'+GOLD}}, bottom:{style:'medium',color:{argb:'FF'+GOLD}}, left:{style:'thin',color:{argb:'FFFFFFFF'}}, right:{style:'thin',color:{argb:'FFFFFFFF'}} } as any;
    });
    headerRow.height=32;
    ws.autoFilter = { from:{row:8,column:1}, to:{row:8,column:COLS.length} };

    // ── صفوف البيانات ──
    const gradeColKeys = ['s1','s2','s3','s4','s5','s6','y1','y2','y3','y4','y5'];
    const pdfColKeys   = ['pdf1','pdf2','pdf3'];
    const STATUS_STYLE: Record<string,(typeof ORG_D)[]> = {
      'قيد المراجعة':[ORG_D,ORG_L], 'مقبول':[GRN_D,GRN_L], 'مرفوض':[RED_D,RED_L],
    };

    filteredApplications.forEach((app:any, ri:number) => {
      const data = buildAppRow(app);
      const rowBg = ri%2===0 ? 'F5F5F5' : 'FFFFFF';
      const row = ws.addRow({ seq:ri+1, ...data });
      row.height = 20;

      COLS.forEach(({key},ci) => {
        const cell = row.getCell(ci+1);
        // رقم
        if(key==='seq'){
          cell.font=fn('FFFFFF',9,true); cell.fill=fl(G_MID); cell.alignment=al(); cell.border=bd() as any;
        }
        // حالة
        else if(key==='status'){
          const [fg,bg]=STATUS_STYLE[data.status]||[G_DARK,'FFFFFF'];
          cell.font=fn(fg,9,true); cell.fill=fl(bg); cell.alignment=al(); cell.border=mbd(fg) as any;
        }
        // معدلات
        else if(gradeColKeys.includes(key)){
          const v=parseFloat(String((data as any)[key]).replace(',','.'));
          if(!isNaN(v)){
            if(v>=14){      cell.font=fn(GRN_D,9,true); cell.fill=fl(GRN_L); }
            else if(v>=10){ cell.font=fn('555555',9);    cell.fill=fl(rowBg); }
            else{            cell.font=fn(RED_D,9,true); cell.fill=fl(RED_L); }
          } else { cell.font=fn('999999',9); cell.fill=fl('EEEEEE'); }
          cell.alignment=al(); cell.border=bd() as any;
        }
        // PDF
        else if(pdfColKeys.includes(key)){
          cell.font=fn(PUR_D,9); cell.fill=fl(PUR_L);
          cell.alignment=al('right'); cell.border=bd() as any;
        }
        // بريد
        else if(key==='email'){
          cell.font=fn(BLU_D,9); cell.fill=fl(rowBg); cell.alignment=al('right'); cell.border=bd() as any;
        }
        else{
          cell.font=fn('1C1C1C',9); cell.fill=fl(rowBg);
          cell.alignment=al(ci===0?'center':'right'); cell.border=bd() as any;
        }
      });
    });

    // ── شريط الإجمالي ──
    const totRow = ws.addRow({seq:'', date:`📊  إجمالي الطلبات`, category:filteredApplications.length});
    ws.mergeCells(totRow.number,1,totRow.number,3);
    for(let c=1;c<=COLS.length;c++){
      const cell=totRow.getCell(c);
      cell.fill=fl(G_DARK);
      if(c===1){ cell.value='📊  إجمالي الطلبات'; cell.font=fn('FFFFFF',10,true); cell.alignment=al('right'); }
      if(c===4){ cell.value=filteredApplications.length; cell.font=fn('FFFFFF',12,true); cell.alignment=al(); }
    }
    totRow.height=22;

    // ══════════════════════════════════════════════════
    // ورقة 2 — ملخص إحصائي
    // ══════════════════════════════════════════════════
    const ws2 = wb.addWorksheet('ملخص إحصائي', {views:[{rightToLeft:true}]});
    ws2.properties.tabColor={argb:'FF'+GOLD};
    ws2.columns=[{width:26},{width:6},{width:6},{width:14},{width:12},{width:10}];

    const addSummaryTitle = (text:string, fill_:string, sz=13) => {
      const r=ws2.addRow([text]);
      ws2.mergeCells(r.number,1,r.number,6);
      const c=r.getCell(1); c.value=text; c.font=fn('FFFFFF',sz,true);
      c.fill=fl(fill_); c.alignment=al(); r.height=sz===13?32:20;
    };
    addSummaryTitle(`📊  ملخص إحصائي — ${deptName} — ماستر 2026`, G_DARK, 14);
    addSummaryTitle(`📅 ${today}  |  إجمالي الطلبات: ${total}`, G_MID, 10);
    const sep=ws2.addRow([]); for(let c=1;c<=6;c++) sep.getCell(c).fill=fl(GOLD); sep.height=5;
    ws2.addRow([]).height=6;

    const sumCards=[
      {label:'📋 إجمالي الطلبات', val:total,    fg:BLU_D, bg:BLU_L},
      {label:'⏳ قيد المراجعة',   val:pending,  fg:ORG_D, bg:ORG_L},
      {label:'✅ مقبول',           val:accepted, fg:GRN_D, bg:GRN_L},
      {label:'❌ مرفوض',           val:rejected, fg:RED_D, bg:RED_L},
    ];
    sumCards.forEach(({label,val,fg,bg})=>{
      const r=ws2.addRow([label,'','',val,total?`${(val/total*100).toFixed(1)}%`:'0%']);
      ws2.mergeCells(r.number,1,r.number,3);
      [1,2,3].forEach(c=>{ const cl=r.getCell(c); cl.font=fn(fg,11,true); cl.fill=fl(bg); cl.alignment=al('right'); cl.border=mbd(fg) as any; });
      r.getCell(4).font=fn(fg,22,true); r.getCell(4).fill=fl(bg); r.getCell(4).alignment=al(); r.getCell(4).border=mbd(fg) as any;
      ws2.mergeCells(r.number,5,r.number,6);
      r.getCell(5).font=fn('555555',10); r.getCell(5).fill=fl(bg); r.getCell(5).alignment=al(); r.getCell(5).border=mbd(fg) as any;
      r.height=36;
    });

    // ══════════════════════════════════════════════════
    // حفظ وتحميل
    // ══════════════════════════════════════════════════
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${deptName}_طلبات_الماستر_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadAsCSV = () => {
    const rows = filteredApplications.map((app:any, i:number) => {
      const d = buildAppRow(app);
      return `${i+1},${d.date},${d.category},${d.regNum},${d.firstName},${d.lastName},${d.birthDate},${d.birthPlace},${d.bacNumber},${d.bacYear},${d.email},${d.phone},${d.university},${d.specialization},${d.s1},${d.s2},${d.s3},${d.s4},${d.s5},${d.s6},${d.y1},${d.y2},${d.y3},${d.y4},${d.y5},${d.master},${d.pdf1},${d.pdf2},${d.pdf3},${d.status},${d.notes}`;
    });
    const header = '#,تاريخ التسجيل,الفئة,رقم التسجيل,الاسم,اللقب,ت.الميلاد,م.الميلاد,رقم الباك,سنة الباك,البريد,الهاتف,جامعة الليسانس,تخصص الليسانس,S1,S2,S3,S4,S5,S6,سنة1,سنة2,سنة3,سنة4,سنة5,تخصص الماستر,كشف الباك,شهادة الليسانس,كشوف الليسانس,الحالة,ملاحظات';
    const csv = '\uFEFF' + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `${admin.departmentName}_${new Date().toISOString().split('T')[0]}.csv`; link.click();
  };

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-bold text-gray-800">{admin.departmentName}</h1>
              <p className="text-sm text-gray-600">{t('departmentDashboard')}</p>
            </div>

            <div className="flex gap-3">
              <LanguageSwitcher />
              <button
                onClick={loadApplications}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm"
              >
                {t('refresh')}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-right" dir="rtl">
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-right" dir="rtl">
                <p className="text-gray-600 text-sm">قيد المراجعة</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-right" dir="rtl">
                <p className="text-gray-600 text-sm">مقبول</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-right" dir="rtl">
                <p className="text-gray-600 text-sm">مرفوض</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* أدوات التحكم */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dir="rtl"
              >
                <option value="all">جميع الطلبات ({stats.total})</option>
                <option value="pending">قيد المراجعة ({stats.pending})</option>
                <option value="accepted">مقبول ({stats.accepted})</option>
                <option value="rejected">مرفوض ({stats.rejected})</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadAsExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                تنزيل Excel
              </button>
              <button
                onClick={downloadAsCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تنزيل CSV
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الطلبات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800" dir="rtl">
              طلبات الترشح ({filteredApplications.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="text-gray-600 mt-4">جاري التحميل...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد طلبات حالياً</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '1400px' }}>
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {['#','التاريخ','الفئة','رقم التسجيل','الاسم','اللقب','ت. الميلاد','م. الميلاد','ر. الباكالوريا','س. الباكالوريا','البريد الإلكتروني','الهاتف','جامعة الليسانس','تخصص الليسانس','S1','S2','S3','S4','S5','S6','سنة1','سنة2','سنة3','سنة4','سنة5','ماستر مرغوب','كشف باك','شهادة ليسانس','كشوف ليسانس','الحالة'].map((h, idx) => (
                      <th key={`${h}-${idx}`} className="px-3 py-3 text-right text-xs font-medium text-gray-500 whitespace-nowrap border-b border-gray-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredApplications.map((app: any, index) => (
                    <tr key={app.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-gray-500">{index + 1}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('ar-DZ') : app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('ar-DZ') : '-'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700" dir="rtl">{app.category || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-gray-800">{app.registrationNumber || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-800" dir="rtl">{app.firstName || (app.fullName ? app.fullName.split(' ')[0] : '-')}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-800" dir="rtl">{app.lastName || (app.fullName ? app.fullName.split(' ').slice(1).join(' ') : '-')}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-600">{app.birthDate || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-600" dir="rtl">{app.birthPlace || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-gray-700">{app.bacNumber || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{app.bacYear || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-blue-600">{app.email || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{app.phone || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700" dir="rtl">{app.licenseUniversity || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700" dir="rtl">{app.licenseSpecialization || '-'}</td>
                      {['semester1','semester2','semester3','semester4','semester5','semester6'].map((s, idx) => (
                        <td key={`${app.id}-${s}-${idx}`} className="px-3 py-3 whitespace-nowrap text-center text-gray-700">
                          {(app as any)[s] || app.semesters?.[s] || '-'}
                        </td>
                      ))}
                      {['year1','year2','year3','year4','year5'].map((y, idx) => (
                        <td key={`${app.id}-${y}-${idx}`} className="px-3 py-3 whitespace-nowrap text-center text-gray-700">
                          {(app as any)[y] || app.years?.[y] || '-'}
                        </td>
                      ))}
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700" dir="rtl">{app.desiredMaster || app.preferences?.join(' | ') || '-'}</td>
                      {/* روابط تحميل ملفات PDF */}
                      {[
                        { key: 'bacTranscript',   label: 'كشف باك' },
                        { key: 'licenseDocument', label: 'شهادة ليسانس' },
                        { key: 'transcripts',     label: 'كشوف ليسانس' },
                      ].map(({ key, label }, idx) => {
                        const f = app.uploadedFiles?.[key];
                        return (
                          <td key={`${app.id}-${key}-${idx}`} className="px-3 py-3 whitespace-nowrap text-xs">
                            {f?.data ? (
                              <a
                                href={f.data}
                                download={f.name || `${label}.pdf`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors font-medium"
                                title={f.name}
                              >
                                ⬇ {label}
                              </a>
                            ) : f && typeof f === 'string' ? (
                              <span className="text-gray-400">{f}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status === 'pending' ? 'قيد المراجعة' :
                           app.status === 'accepted' ? 'مقبول' :
                           app.status === 'rejected' ? 'مرفوض' : 'تمت المراجعة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
