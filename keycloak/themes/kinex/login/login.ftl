<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <h1>Chào mừng trở lại</h1>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Đăng nhập để vào không gian làm việc của bạn</p>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    
                    <div class="form-group">
                        <label for="username">Tài khoản hoặc Email</label>
                        <input id="username" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off"
                               placeholder="Email của bạn..." />
                    </div>

                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label for="password">Mật khẩu</label>
                            <#if realm.resetPasswordAllowed>
                                <a href="${url.loginResetCredentialsUrl}" style="font-size: 12px; color: var(--primary-light); text-decoration: none; margin-bottom: 8px;">Quên mật khẩu?</a>
                            </#if>
                        </div>
                        <input id="password" name="password" type="password" autocomplete="off"
                               placeholder="••••••••" />
                    </div>

                    <div id="kc-form-options" class="form-group">
                        <#if realm.rememberMe && !login.rememberMe??>
                            <label class="checkbox">
                                <input id="rememberMe" name="rememberMe" type="checkbox" checked>
                                Ghi nhớ đăng nhập
                            </label>
                        </#if>
                    </div>

                    <div id="kc-form-buttons" class="form-group">
                        <button name="login" id="kc-login" type="submit">
                            Đăng nhập hệ thống
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <#if realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-info" class="footer">
                <p>Mới sử dụng KiNEX? <a href="${url.registrationUrl}">Tạo tài khoản ngay</a></p>
            </div>
        </#if>

        <#if realm.password && social.providers??>
            <div id="kc-social-providers" class="footer">
                <p style="margin: 1.5rem 0 1rem; opacity: 0.4; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Hoặc tiếp tục với</p>
                <div style="display: flex; gap: 0.75rem; justify-content: center;">
                    <#list social.providers as p>
                        <a href="${p.loginUrl}" style="padding: 10px 20px; border: 1px solid var(--glass-border); border-radius: 12px; text-decoration: none; font-size: 13px; color: white; background: rgba(255,255,255,0.03); transition: all 0.2s;">
                            ${p.displayName!}
                        </a>
                    </#list>
                </div>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
