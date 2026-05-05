"use client";

import { useEffect, useState } from "react";

export default function DisclaimerModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("disclaimer-accepted");
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimer-accepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-yellow-500/30 bg-gradient-to-br from-[#0a0a0f] to-[#0d0a08] p-6 shadow-2xl shadow-yellow-500/20 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-4xl">⚠️</span>
          <h2 className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-2xl font-bold text-transparent">
            法律声明与免责条款
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-stone-300">
          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">一、服务性质</h3>
            <p>
              本平台（Immortal）仅作为信息展示和分享平台，不对任何第三方提交的内容进行实质性审查、编辑或背书。平台不是内容的发布者或创作者，仅提供技术服务。
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">二、用户责任</h3>
            <ul className="ml-4 list-disc space-y-1">
              <li>用户提交的所有内容（包括但不限于文字、图片、链接）的真实性、合法性、准确性由提交者本人承担全部法律责任</li>
              <li>用户保证其提交内容不侵犯任何第三方的知识产权、隐私权或其他合法权益</li>
              <li>用户保证其提交内容不违反中华人民共和国法律法规及相关国际公约</li>
              <li>用户因提交内容引发的任何法律纠纷、经济损失或其他后果，由用户本人独立承担</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">三、平台免责</h3>
            <ul className="ml-4 list-disc space-y-1">
              <li>平台对用户提交内容的真实性、合法性、准确性不作任何明示或暗示的保证</li>
              <li>平台不对用户使用第三方链接或工具产生的任何损失承担责任</li>
              <li>平台不对因不可抗力、网络故障、黑客攻击等原因导致的服务中断或数据丢失承担责任</li>
              <li>平台有权在不通知的情况下删除违法违规内容，但删除行为不构成平台对其他内容合法性的认可</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">四、知识产权</h3>
            <p>
              用户提交内容涉及的知识产权归原权利人所有。如权利人认为平台展示的内容侵犯其合法权益，请提供书面通知，平台将依法及时处理。
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">五、争议解决</h3>
            <p>
              因使用本平台产生的任何争议，应首先通过友好协商解决；协商不成的，提交至平台所在地有管辖权的人民法院诉讼解决。
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-yellow-200">六、条款变更</h3>
            <p>
              平台有权随时修改本声明，修改后的声明一经发布即生效。继续使用本平台即视为接受修改后的声明。
            </p>
          </section>

          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-900/10 p-4">
            <p className="font-semibold text-red-200">
              ⚠️ 重要提示：点击"我已阅读并同意"即表示您已完整阅读、理解并同意遵守上述所有条款。如不同意，请立即停止使用本平台。
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-gradient-to-r from-lime-300 to-yellow-300 px-6 py-3 font-semibold text-black transition hover:from-lime-200 hover:to-yellow-200"
          >
            我已阅读并同意
          </button>
        </div>
      </div>
    </div>
  );
}
