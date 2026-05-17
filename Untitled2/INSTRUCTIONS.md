// ============================================================
// firebaseConfig.tsx — Firebase REST API (لا يحتاج npm)
// ضعي هذا الملف مكان firebaseConfig.tsx القديم
// ============================================================

const DB_URL = "https://university-master-portal-default-rtdb.firebaseio.com";

// حفظ بيانات جديدة (يكافئ push)
export async function pushToFirebase(path: string, data: object): Promise<string> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase POST error: ${res.statusText}`);
  const result = await res.json();
  return result.name; // ID الجديد
}

// جلب كل البيانات من مسار معين
export async function getFromFirebase(path: string): Promise<Record<string, any> | null> {
  const res = await fetch(`${DB_URL}/${path}.json`);
  if (!res.ok) throw new Error(`Firebase GET error: ${res.statusText}`);
  return res.json();
}

// تحديث حقل معين (يكافئ update)
export async function updateInFirebase(path: string, data: object): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PATCH error: ${res.statusText}`);
}

// حذف عنصر
export async function deleteFromFirebase(path: string): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Firebase DELETE error: ${res.statusText}`);
}
