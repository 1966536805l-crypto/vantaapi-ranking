export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 信息收集</h2>
            <p className="mb-2">我们收集以下信息：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>您提交的排行榜内容（标题、描述、图片链接）</li>
              <li>提交者名称（可选）</li>
              <li>访问日志（IP 地址、访问时间、浏览器信息）</li>
              <li>管理员账户信息（用户名、邮箱、加密密码）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 信息用途</h2>
            <p className="mb-2">我们使用收集的信息用于：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>展示和管理排行榜内容</li>
              <li>防止滥用和垃圾信息</li>
              <li>改进网站功能和用户体验</li>
              <li>处理违规举报和投诉</li>
              <li>遵守法律法规要求</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 信息保存</h2>
            <p>我们会保存您的信息直到：</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>用户提交的内容：永久保存，除非被删除或举报移除</li>
              <li>访问日志：保存 90 天</li>
              <li>举报记录：保存 2 年（法律要求）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 信息安全</h2>
            <p>我们采取以下措施保护您的信息：</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>数据库仅限内网访问</li>
              <li>密码使用 bcrypt 加密存储</li>
              <li>HTTPS 加密传输</li>
              <li>定期安全审计和更新</li>
              <li>严格的访问控制和权限管理</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 您的权利</h2>
            <p className="mb-2">您有权：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>查看您提交的内容</li>
              <li>要求删除您的内容（联系管理员）</li>
              <li>反对不当使用您的信息</li>
              <li>获取我们持有的关于您的信息副本</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 删除账号和数据</h2>
            <p>如需删除您的数据，请通过以下方式联系我们：</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>邮箱：privacy@vantaapi.com</li>
              <li>我们将在 7 个工作日内处理您的请求</li>
              <li>删除后的数据无法恢复</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookie 使用</h2>
            <p>我们使用 Cookie 用于：</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>保持登录状态</li>
              <li>记住用户偏好设置</li>
              <li>分析网站使用情况</li>
            </ul>
            <p className="mt-2">您可以通过浏览器设置禁用 Cookie，但这可能影响网站功能。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 第三方服务</h2>
            <p>我们不会向第三方出售或共享您的个人信息，除非：</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>获得您的明确同意</li>
              <li>法律法规要求</li>
              <li>保护我们的合法权益</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 未成年人保护</h2>
            <p>我们不会故意收集 14 岁以下未成年人的个人信息。如果您是未成年人的监护人，发现我们收集了未成年人信息，请立即联系我们删除。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 政策更新</h2>
            <p>我们可能会不定期更新本隐私政策。重大变更时，我们会在网站显著位置通知您。继续使用本网站即表示您接受更新后的政策。</p>
            <p className="mt-2 text-sm text-gray-600">最后更新时间：2026年5月5日</p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">联系我们</h2>
            <p>如有任何隐私相关问题，请联系：</p>
            <ul className="list-none space-y-1 mt-2">
              <li>邮箱：privacy@vantaapi.com</li>
              <li>我们承诺在 24 小时内回复您的咨询</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
