<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayWide=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>

<body class="kinex-auth-page">
    <div class="auth-background">
        <div class="glow-sphere sphere-1"></div>
        <div class="glow-sphere sphere-2"></div>
    </div>

    <div class="auth-container">
        <header class="auth-header">
            <div class="auth-logo">
                <span class="logo-icon">K</span>
                <span class="logo-text">KiNEX <span>Workspace</span></span>
            </div>
            <#nested "header">
        </header>

        <main class="auth-card">
            <div id="kc-content">
                <div id="kc-content-wrapper">
                    <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="alert alert-${message.type}">
                            <#if message.type = 'success'><span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span></#if>
                            <#if message.type = 'warning'><span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span></#if>
                            <#if message.type = 'error'><span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span></#if>
                            <#if message.type = 'info'><span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span></#if>
                        </div>
                    </#if>
                    <#nested "form">
                </div>
            </div>
        </main>
        
        <footer class="auth-footer">
            &copy; 2026 KiNEX Ecosystem. All rights reserved.
        </footer>
    </div>
</body>
</html>
</#macro>
