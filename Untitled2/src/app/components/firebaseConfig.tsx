// ============================================================
// firebaseConfig.tsx — Firebase REST API
// ============================================================
//
// 📋 قواعد Firebase التي يجب تطبيقها في Firebase Console:
//   Database → Rules → انسخ هذا:
//
//   {
//     "rules": {
//       ".read": true,
//       ".write": true
//     }
//   }
//
//   ⚠️  هذا مؤقت لضمان عمل المنصة. للحماية المتقدمة لاحقاً:
//   استخدم Firebase Authentication وربط الأدمن بحساب Google.
//
// ============================================================

const DB_URL = "https://university-master-portal-default-rtdb.firebaseio.com";

// ── حفظ بيانات جديدة ────────────────────────────────────────
export async function pushToFirebase(path: string, data: object): Promise<string> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase POST error: ${res.status} ${res.statusText}`);
  const result = await res.json();
  return result.name;
}

// ── جلب كل البيانات من مسار معين ───────────────────────────
export async function getFromFirebase(path: string): Promise<Record<string, any> | null> {
  const res = await fetch(`${DB_URL}/${path}.json`);
  if (!res.ok) throw new Error(`Firebase GET error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── تحديث حقل معين ──────────────────────────────────────────
export async function updateInFirebase(path: string, data: object): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PATCH error: ${res.status} ${res.statusText}`);
}

// ── حذف عنصر ────────────────────────────────────────────────
export async function deleteFromFirebase(path: string): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Firebase DELETE error: ${res.status} ${res.statusText}`);
}

// ════════════════════════════════════════════════════════════
// دوال موحّدة — كلها تقرأ وتكتب من Firebase مباشرة
// ════════════════════════════════════════════════════════════

// ── جلب جميع الطلبات من جميع الأقسام (للأدمن الرئيسي) ─────
export async function getAllApplications(): Promise<any[]> {
  try {
    const data = await getFromFirebase("applications");
    if (!data) return [];

    const allApps: any[] = [];
    for (const [deptId, deptApps] of Object.entries(data)) {
      if (deptApps && typeof deptApps === "object") {
        for (const [id, app] of Object.entries(deptApps as Record<string, any>)) {
          allApps.push({ id, departmentId: deptId, ...app });
        }
      }
    }
    return allApps.sort((a, b) => {
      const da = a.submittedAt || a.submissionDate || "";
      const db = b.submittedAt || b.submissionDate || "";
      return db.localeCompare(da);
    });
  } catch (error) {
    console.error("خطأ في جلب جميع الطلبات:", error);
    return [];
  }
}

// ── تحديث حالة طلب في Firebase ──────────────────────────────
export async function updateApplicationStatus(
  departmentId: string,
  appId: string,
  status: "pending" | "accepted" | "rejected"
): Promise<void> {
  await updateInFirebase(`applications/${departmentId}/${appId}`, { status });
}

// ── حذف طلب من Firebase ─────────────────────────────────────
export async function deleteApplication(
  departmentId: string,
  appId: string
): Promise<void> {
  await deleteFromFirebase(`applications/${departmentId}/${appId}`);
}
