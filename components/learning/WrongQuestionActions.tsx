"use client";

import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

const copy: Record<InterfaceLanguage, {
  removed: string;
  removeFailed: string;
  reviewed: string;
  markReviewed: string;
  remove: string;
  reviewHint: string;
}> = {
  en: {
    removed: "Removed from wrong-question review",
    removeFailed: "Remove failed",
    reviewed: "Reviewed this round",
    markReviewed: "Mark reviewed",
    remove: "Remove",
    reviewHint: "Good. Go back to the lesson and solve it once more.",
  },
  zh: {
    removed: "已从错题收藏移除",
    removeFailed: "移除失败",
    reviewed: "本轮已复习",
    markReviewed: "标记本轮复习",
    remove: "移出错题",
    reviewHint: "很好，下一步回知识点重做一次。",
  },
  ja: {
    removed: "復習リストから削除しました",
    removeFailed: "削除に失敗しました",
    reviewed: "この回は復習済み",
    markReviewed: "復習済みにする",
    remove: "削除",
    reviewHint: "よし。次はレッスンに戻ってもう一度解きます。",
  },
  ko: { removed: "오답 복습에서 제거했습니다", removeFailed: "제거 실패", reviewed: "이번 회차 복습 완료", markReviewed: "복습 완료 표시", remove: "제거", reviewHint: "좋아요. 다시 레슨으로 돌아가 한 번 더 풀어보세요." },
  es: { removed: "Eliminado de la revision de errores", removeFailed: "No se pudo eliminar", reviewed: "Revisado esta ronda", markReviewed: "Marcar revisado", remove: "Eliminar", reviewHint: "Bien. Vuelve a la leccion y resuelvelo una vez mas." },
  fr: { removed: "Retire de la revision des erreurs", removeFailed: "Suppression echouee", reviewed: "Revise ce tour", markReviewed: "Marquer revise", remove: "Retirer", reviewHint: "Bien. Retourne a la lecon et resous le encore une fois." },
  de: { removed: "Aus der Fehlerwiederholung entfernt", removeFailed: "Entfernen fehlgeschlagen", reviewed: "In dieser Runde wiederholt", markReviewed: "Als wiederholt markieren", remove: "Entfernen", reviewHint: "Gut. Geh zur Lektion zurueck und loese es noch einmal." },
  pt: { removed: "Removido da revisao de erros", removeFailed: "Falha ao remover", reviewed: "Revisado nesta rodada", markReviewed: "Marcar revisado", remove: "Remover", reviewHint: "Bom. Volte para a aula e resolva mais uma vez." },
  ru: { removed: "Удалено из повторения ошибок", removeFailed: "Не удалось удалить", reviewed: "Повторено в этом раунде", markReviewed: "Отметить повторенным", remove: "Удалить", reviewHint: "Хорошо. Вернись к уроку и реши еще раз." },
  ar: {
    removed: "تمت الإزالة من مراجعة الأخطاء",
    removeFailed: "فشلت الإزالة",
    reviewed: "تمت المراجعة في هذه الجولة",
    markReviewed: "علّم كمراجَع",
    remove: "إزالة",
    reviewHint: "جيد. ارجع إلى الدرس وحلها مرة أخرى.",
  },
  hi: { removed: "गलत प्रश्न समीक्षा से हटाया गया", removeFailed: "हटाना विफल", reviewed: "इस दौर में समीक्षा हुई", markReviewed: "समीक्षित चिह्नित करें", remove: "हटाएं", reviewHint: "अच्छा. पाठ पर लौटकर इसे फिर हल करें." },
  id: { removed: "Dihapus dari ulasan salah", removeFailed: "Gagal hapus", reviewed: "Sudah ditinjau putaran ini", markReviewed: "Tandai ditinjau", remove: "Hapus", reviewHint: "Bagus. Kembali ke pelajaran dan selesaikan sekali lagi." },
  vi: { removed: "Da xoa khoi on cau sai", removeFailed: "Xoa that bai", reviewed: "Da on trong luot nay", markReviewed: "Danh dau da on", remove: "Xoa", reviewHint: "Tot. Quay lai bai hoc va lam lai mot lan nua." },
  th: { removed: "ลบออกจากรายการทบทวนข้อผิดแล้ว", removeFailed: "ลบไม่สำเร็จ", reviewed: "ทบทวนรอบนี้แล้ว", markReviewed: "ทำเครื่องหมายว่าทบทวนแล้ว", remove: "ลบ", reviewHint: "ดีมาก กลับไปที่บทเรียนแล้วลองทำอีกครั้ง" },
  tr: { removed: "Yanlis tekrarindan kaldirildi", removeFailed: "Kaldirma basarisiz", reviewed: "Bu turde tekrarlandi", markReviewed: "Tekrarlandi isaretle", remove: "Kaldir", reviewHint: "Guzel. Derse don ve bir kez daha coz." },
  it: { removed: "Rimosso dal ripasso errori", removeFailed: "Rimozione fallita", reviewed: "Ripassato in questo turno", markReviewed: "Segna ripassato", remove: "Rimuovi", reviewHint: "Bene. Torna alla lezione e risolvilo ancora una volta." },
  nl: { removed: "Verwijderd uit foutenherhaling", removeFailed: "Verwijderen mislukt", reviewed: "Deze ronde herhaald", markReviewed: "Markeer herhaald", remove: "Verwijderen", reviewHint: "Goed. Ga terug naar de les en los het nog eens op." },
  pl: { removed: "Usunieto z powtorki bledow", removeFailed: "Usuwanie nieudane", reviewed: "Powtorzone w tej rundzie", markReviewed: "Oznacz jako powtorzone", remove: "Usun", reviewHint: "Dobrze. Wroc do lekcji i rozwiaz to jeszcze raz." },
};

export default function WrongQuestionActions({
  id,
  language = "en",
}: {
  id: string;
  language?: InterfaceLanguage;
}) {
  const t = copy[language];
  const [removed, setRemoved] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");

  if (removed) return <p className="mt-4 rounded-[8px] border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{t.removed}</p>;

  async function remove() {
    const response = await fetch(`/api/wrong?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setRemoved(true);
      return;
    }
    setMessage(data.message || t.removeFailed);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setReviewed(true)}
        className="apple-button-primary px-3 py-2 text-sm disabled:opacity-60"
        disabled={reviewed}
      >
        {reviewed ? t.reviewed : t.markReviewed}
      </button>
      <button type="button" onClick={remove} className="apple-button-secondary px-3 py-2 text-sm hover:border-red-200 hover:text-red-700">
        {t.remove}
      </button>
      {reviewed && <span className="text-sm text-emerald-700">{t.reviewHint}</span>}
      {message && <span className="text-sm text-red-700">{message}</span>}
    </div>
  );
}
