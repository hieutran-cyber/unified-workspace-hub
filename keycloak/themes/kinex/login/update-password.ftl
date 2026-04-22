<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        <h1>Thiết lập mật khẩu</h1>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Vui lòng đặt mật khẩu mới để bảo mật tài khoản của bạn</p>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
                    
                    <div class="form-group">
                        <label for="password-new">Mật khẩu mới</label>
                        <input type="password" id="password-new" name="password-new" autocomplete="new-password"
                               placeholder="Nhập mật khẩu mới..." autofocus />
                    </div>

                    <div class="form-group">
                        <label for="password-confirm">Xác nhận mật khẩu</label>
                        <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password"
                               placeholder="Nhập lại mật khẩu..." />
                    </div>

                    <div id="kc-form-buttons" class="form-group">
                        <button type="submit">
                            Cập nhật mật khẩu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
