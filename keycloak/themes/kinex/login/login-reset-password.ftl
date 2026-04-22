<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        <h1>Quên mật khẩu?</h1>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Nhập email của bạn để nhận link khôi phục mật khẩu</p>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
                    <div class="form-group">
                        <label for="username">Email tài khoản</label>
                        <input type="text" id="username" name="username" autofocus
                               placeholder="Email của bạn..."
                               value="${(auth.attemptedUsername!'')}"/>
                    </div>

                    <div id="kc-form-buttons" class="form-group">
                        <button type="submit">
                            Gửi link khôi phục
                        </button>
                    </div>

                    <div id="kc-info" class="footer" style="text-align: center; margin-top: 1.5rem;">
                        <p><a href="${url.loginUrl}" style="color: var(--primary-light); text-decoration: none; font-size: 14px; font-weight: 600;">&larr; Quay lại đăng nhập</a></p>
                    </div>
                </form>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
