import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-5 py-6 sm:px-8">
        <nav className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-stone-200 transition hover:text-lime-200"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-sm font-black text-black">
              I
            </span>
            <span className="font-semibold">返回首页</span>
          </Link>
        </nav>

        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl">⚖️</span>
            <h1 className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-3xl font-bold text-transparent">
              服务条款与法律声明
            </h1>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-stone-300">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">一、服务性质与平台定位</h2>
              <p>
                Immortal（以下简称"本平台"）是一个信息展示和分享平台，仅提供技术服务支持。本平台不是内容的发布者、创作者或编辑者，不对任何第三方用户提交的内容进行实质性审查、编辑、修改或背书。
              </p>
              <p className="mt-2">
                本平台展示的所有内容均由用户自行提交，平台仅作为技术中介提供信息存储空间服务。平台对用户提交内容的展示不构成对该内容真实性、合法性、准确性的认可或保证。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">二、用户责任与义务</h2>
              <h3 className="mb-2 font-semibold text-stone-200">2.1 内容责任</h3>
              <ul className="ml-4 list-disc space-y-2">
                <li>用户对其提交的所有内容（包括但不限于文字、图片、链接、描述）的真实性、合法性、准确性、完整性承担全部法律责任</li>
                <li>用户保证其提交内容不侵犯任何第三方的知识产权、商标权、著作权、隐私权、名誉权或其他合法权益</li>
                <li>用户保证其提交内容不违反中华人民共和国法律法规、行政规章及相关国际公约</li>
                <li>用户保证其对提交内容拥有合法权利或已获得必要的授权许可</li>
              </ul>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">2.2 禁止行为</h3>
              <p>用户不得提交以下内容：</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>违反宪法确定的基本原则的内容</li>
                <li>危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一的内容</li>
                <li>损害国家荣誉和利益的内容</li>
                <li>煽动民族仇恨、民族歧视、破坏民族团结的内容</li>
                <li>破坏国家宗教政策、宣扬邪教和封建迷信的内容</li>
                <li>散布谣言、扰乱社会秩序、破坏社会稳定的内容</li>
                <li>散布淫秽、色情、赌博、暴力、恐怖或者教唆犯罪的内容</li>
                <li>侮辱或者诽谤他人、侵害他人合法权益的内容</li>
                <li>含有虚假、诈骗、有害、胁迫、侵害他人隐私、骚扰、侵害、中伤、粗俗、猥亵或其他道德上令人反感的内容</li>
                <li>含有病毒、木马、恶意代码或其他可能损害计算机系统的内容</li>
              </ul>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">2.3 法律后果</h3>
              <p>
                用户因提交内容引发的任何法律纠纷、行政处罚、民事赔偿、刑事责任或其他法律后果，由用户本人独立承担，与本平台无关。本平台不承担任何连带责任。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">三、平台权利与免责</h2>
              <h3 className="mb-2 font-semibold text-stone-200">3.1 内容管理权</h3>
              <ul className="ml-4 list-disc space-y-2">
                <li>平台有权（但无义务）对用户提交内容进行审查、监控或删除</li>
                <li>平台有权在不事先通知的情况下删除违法违规内容</li>
                <li>平台删除内容的行为不构成对其他内容合法性的认可或保证</li>
                <li>平台有权根据法律法规要求或司法机关、行政机关要求提供用户信息</li>
              </ul>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">3.2 免责声明</h3>
              <ul className="ml-4 list-disc space-y-2">
                <li>平台对用户提交内容的真实性、合法性、准确性、完整性、及时性不作任何明示或暗示的保证</li>
                <li>平台不对用户使用第三方链接、工具或服务产生的任何直接或间接损失承担责任</li>
                <li>平台不对因不可抗力（包括但不限于自然灾害、战争、罢工、政府行为）导致的服务中断或数据丢失承担责任</li>
                <li>平台不对因网络故障、黑客攻击、病毒入侵、系统维护等技术原因导致的服务中断或数据丢失承担责任</li>
                <li>平台不对用户之间或用户与第三方之间因使用本平台产生的任何纠纷承担责任</li>
              </ul>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">3.3 服务变更与中断</h3>
              <p>
                平台有权随时修改、暂停或终止部分或全部服务，无需事先通知用户。因服务变更、暂停或终止给用户造成的损失，平台不承担任何责任。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">四、知识产权</h2>
              <h3 className="mb-2 font-semibold text-stone-200">4.1 平台知识产权</h3>
              <p>
                本平台的商标、标识、界面设计、程序代码等知识产权归平台所有。未经平台书面许可，任何人不得擅自使用、复制、修改、传播。
              </p>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">4.2 用户内容知识产权</h3>
              <p>
                用户提交内容的知识产权归原权利人所有。用户提交内容即视为授权平台在全球范围内免费、非独占、可转授权地使用该内容（包括但不限于展示、存储、传播）。
              </p>

              <h3 className="mb-2 mt-4 font-semibold text-stone-200">4.3 侵权投诉</h3>
              <p>
                如权利人认为平台展示的内容侵犯其合法权益，请提供以下材料的书面通知：
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>权利人的身份证明或授权委托书</li>
                <li>权属证明材料</li>
                <li>侵权内容的准确位置</li>
                <li>联系方式</li>
              </ul>
              <p className="mt-2">
                平台收到符合要求的通知后，将依法及时处理。但平台不保证处理时效，也不对处理结果承担责任。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">五、隐私保护</h2>
              <p>
                平台重视用户隐私保护。平台收集的用户信息仅用于提供服务、改进服务质量或履行法律义务。平台不会向第三方出售、出租或以其他方式披露用户信息，但以下情况除外：
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>获得用户明确授权</li>
                <li>根据法律法规要求</li>
                <li>应司法机关、行政机关要求</li>
                <li>为维护平台合法权益所必需</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">六、争议解决</h2>
              <p>
                本条款的订立、执行、解释及争议解决均适用中华人民共和国法律。因使用本平台产生的任何争议，双方应首先通过友好协商解决；协商不成的，任何一方均有权向本平台所在地有管辖权的人民法院提起诉讼。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">七、条款变更</h2>
              <p>
                平台有权随时修改本条款。修改后的条款一经在平台发布即生效，无需另行通知用户。用户继续使用本平台即视为接受修改后的条款。如用户不同意修改后的条款，应立即停止使用本平台。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-yellow-200">八、其他</h2>
              <p>
                本条款构成用户与平台之间关于使用本平台的完整协议。如本条款的任何条款被认定为无效或不可执行，该条款应被解释为反映双方原意的有效条款，其他条款继续有效。
              </p>
              <p className="mt-2">
                本条款的标题仅为方便阅读而设，不影响条款的解释。
              </p>
            </section>

            <div className="mt-8 rounded-lg border border-red-500/30 bg-red-900/10 p-4">
              <p className="font-semibold text-red-200">
                ⚠️ 最终声明：使用本平台即表示您已完整阅读、充分理解并完全同意遵守本条款的所有内容。如您不同意本条款的任何内容，请立即停止使用本平台。
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-stone-500">
              最后更新时间：2026年5月5日
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
