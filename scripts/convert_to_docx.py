"""
Markdown → DOCX converter with rich, presentation-grade diagrams.

Diagram blocks use the form:

    ```diagram <name>
    (optional ascii fallback content; ignored if <name> matches a renderer)
    ```

Supported diagram names:
  - hub-spoke          : Central Workspace Hub with spoke applications
  - hierarchy          : Org → Property → App → User tree
  - auth-keycloak      : Sequence diagram for Keycloak login + SSO
  - auth-clerk         : Sequence diagram for Clerk login + Identity Broker
  - provisioning       : BullMQ provisioning + retry/DLQ
  - inter-app-comm     : Network topology with security boundaries
  - keycloak-deploy    : Deployment topology (Keycloak option)
  - clerk-deploy       : Deployment topology (Clerk option)

Without a recognized name, the block falls back to a styled monospace box.
"""

import os
import re
import subprocess
import sys
import tempfile

# --- Dependency bootstrap ---------------------------------------------------
def _ensure(pkg, import_name=None):
    try:
        __import__(import_name or pkg)
    except ImportError:
        print(f"Đang cài đặt {pkg}...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pkg, "--break-system-packages"],
            stdout=subprocess.DEVNULL,
        )

_ensure("python-docx", "docx")
_ensure("matplotlib")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
from matplotlib.lines import Line2D

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# --- Color palette (executive/CEO friendly) --------------------------------
PRIMARY      = "#1E3A8A"   # deep blue
PRIMARY_SOFT = "#DBEAFE"
SECONDARY    = "#7C3AED"   # purple
SECONDARY_SOFT = "#EDE9FE"
ACCENT       = "#059669"   # green
ACCENT_SOFT  = "#D1FAE5"
WARN         = "#DC2626"   # red
WARN_SOFT    = "#FEE2E2"
NEUTRAL      = "#334155"
NEUTRAL_SOFT = "#F1F5F9"
BG           = "#FFFFFF"
LINE         = "#94A3B8"


# --- Diagram primitives ----------------------------------------------------
def _new_fig(w=11, h=6.5):
    fig, ax = plt.subplots(figsize=(w, h), dpi=160)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor(BG)
    return fig, ax


def _box(ax, x, y, w, h, label, sub=None, fill=PRIMARY_SOFT, edge=PRIMARY,
         text_color=NEUTRAL, fontsize=10, bold=True, radius=0.6):
    box = FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.02,rounding_size={radius}",
        linewidth=1.2, facecolor=fill, edgecolor=edge,
    )
    ax.add_patch(box)
    cx, cy = x + w / 2, y + h / 2
    if sub:
        ax.text(cx, cy + h * 0.15, label, ha="center", va="center",
                fontsize=fontsize, fontweight="bold" if bold else "normal",
                color=text_color)
        ax.text(cx, cy - h * 0.20, sub, ha="center", va="center",
                fontsize=fontsize - 2, color=text_color, alpha=0.8)
    else:
        ax.text(cx, cy, label, ha="center", va="center",
                fontsize=fontsize, fontweight="bold" if bold else "normal",
                color=text_color)
    return (cx, cy, x, y, w, h)


def _arrow(ax, p1, p2, label=None, color=NEUTRAL, style="-",
           curve=0.0, fontsize=8, dashed=False, label_offset=(0, 0)):
    ls = "--" if dashed else "-"
    arr = FancyArrowPatch(
        p1, p2, arrowstyle="-|>", mutation_scale=12,
        color=color, linewidth=1.2, linestyle=ls,
        connectionstyle=f"arc3,rad={curve}",
    )
    ax.add_patch(arr)
    if label:
        mx = (p1[0] + p2[0]) / 2 + label_offset[0]
        my = (p1[1] + p2[1]) / 2 + label_offset[1]
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=fontsize, color=color,
                bbox=dict(boxstyle="round,pad=0.2", fc=BG, ec="none", alpha=0.85))


def _title(ax, text, y=96):
    ax.text(50, y, text, ha="center", va="center",
            fontsize=13, fontweight="bold", color=PRIMARY)


# --- Renderers -------------------------------------------------------------

def render_hub_spoke():
    fig, ax = _new_fig(11, 7)
    _title(ax, "Kiến trúc Tổng thể: Workspace Hub & Ứng dụng Vệ tinh")

    # IdP (left)
    idp = _box(ax, 4, 60, 22, 18, "IDENTITY PROVIDER",
               sub="Keycloak / Clerk",
               fill=SECONDARY_SOFT, edge=SECONDARY, fontsize=11)

    # Hub (center)
    hub = _box(ax, 38, 50, 24, 30, "WORKSPACE HUB",
               sub="hub-api · hub-web · DB · Redis",
               fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=12)

    # Apps (right column)
    apps = []
    app_names = [
        ("Odoo (ERP)", ACCENT_SOFT, ACCENT),
        ("PMS (Hotel)", ACCENT_SOFT, ACCENT),
        ("POS (Sales)", ACCENT_SOFT, ACCENT),
        ("Future App", NEUTRAL_SOFT, LINE),
    ]
    for i, (name, fc, ec) in enumerate(app_names):
        y = 78 - i * 16
        b = _box(ax, 75, y, 20, 12, name,
                 sub="per-Org instance",
                 fill=fc, edge=ec, fontsize=10)
        apps.append(b)

    # Users (bottom)
    user = _box(ax, 38, 12, 24, 14, "End Users",
                sub="Browser / Mobile",
                fill=NEUTRAL_SOFT, edge=NEUTRAL, fontsize=10)

    # Arrows
    _arrow(ax, (user[0], user[1] + 7), (hub[0], hub[1] - 15),
           "1. Login", color=NEUTRAL, label_offset=(0, 0))
    _arrow(ax, (hub[0] - 12, hub[1]), (idp[0] + 11, idp[1]),
           "2. OIDC / SAML", color=SECONDARY, curve=0.1)
    for b in apps:
        _arrow(ax, (hub[0] + 12, hub[1] + 5), (b[0] - 10, b[1]),
               color=ACCENT, curve=-0.05)

    _arrow(ax, (hub[0] + 12, hub[1] - 5), (apps[0][0] - 10, apps[0][1] - 2),
           "3. Provisioning + SSO", color=ACCENT,
           curve=-0.15, label_offset=(2, -2))

    # Legend
    ax.text(50, 4, "→ Hub điều phối định danh, phân quyền và đồng bộ dữ liệu giữa các ứng dụng",
            ha="center", fontsize=9, color=NEUTRAL, style="italic")
    return fig


def render_hierarchy():
    fig, ax = _new_fig(13, 9)
    _title(ax, "Mô hình Dữ liệu: Organization → Apps → Cấu trúc Nội bộ → Role → User", y=97)

    # Level 0 — Organization
    org = _box(ax, 36, 86, 28, 9, "ORGANIZATION (Tenant)",
               sub="Cấp cao nhất · Cách ly tuyệt đối",
               fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)

    # Level 1 — Three Apps (each Org owns these apps)
    odoo_app = _box(ax, 4, 70, 28, 8, "ODOO App", sub="ERP",
                    fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)
    pms_app  = _box(ax, 36, 70, 28, 8, "PMS App", sub="Hotel Mgmt",
                    fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)
    pos_app  = _box(ax, 68, 70, 28, 8, "POS App", sub="Sales",
                    fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)

    for app in (odoo_app, pms_app, pos_app):
        _arrow(ax, (org[0], 86), (app[0], 78), color=PRIMARY)

    # ----- ODOO internal model (left column) -----
    # Odoo has TWO independent axes: Department and Company-Property
    odoo_dept = _box(ax, 4, 56, 13, 7, "Department",
                     fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    odoo_comp = _box(ax, 19, 56, 13, 7, "Company",
                     fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    odoo_prop = _box(ax, 19, 44, 13, 7, "Property",
                     fill="#FFFFFF", edge=ACCENT, fontsize=8.5)

    _arrow(ax, (odoo_app[0] - 8, 70), (odoo_dept[0], 63), color=ACCENT, fontsize=7)
    _arrow(ax, (odoo_app[0] + 8, 70), (odoo_comp[0], 63), color=ACCENT, fontsize=7)
    # Company <-> Property is M:N
    _arrow(ax, (odoo_comp[0], 56), (odoo_prop[0], 51), color=ACCENT, fontsize=7)
    ax.text(odoo_comp[0] + 3, 53.5, "M:N", fontsize=7, color=WARN,
            fontweight="bold")

    # Note for Odoo
    ax.text(18, 39, "Department và Property\nKHÔNG có quan hệ trực tiếp",
            ha="center", fontsize=7, color=WARN, style="italic")
    ax.text(18, 34, "User: optional thuộc Company,\noptional thuộc Property",
            ha="center", fontsize=7, color=NEUTRAL, style="italic")

    # ----- PMS internal model (middle column) -----
    pms_comp = _box(ax, 39, 56, 22, 7, "Company",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    pms_prop = _box(ax, 39, 47, 22, 7, "Property",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    pms_outl = _box(ax, 39, 38, 22, 7, "Outlet",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)

    _arrow(ax, (pms_app[0], 70), (pms_comp[0], 63), color=ACCENT, fontsize=7)
    _arrow(ax, (pms_comp[0], 56), (pms_prop[0], 54), color=ACCENT)
    _arrow(ax, (pms_prop[0], 47), (pms_outl[0], 45), color=ACCENT)

    ax.text(50, 33, "User BẮT BUỘC thuộc Company\nkhi đăng nhập",
            ha="center", fontsize=7, color=WARN, style="italic")

    # ----- POS internal model (right column) -----
    pos_comp = _box(ax, 71, 56, 22, 7, "Company",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    pos_prop = _box(ax, 71, 47, 22, 7, "Property",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)
    pos_outl = _box(ax, 71, 38, 22, 7, "Outlet",
                    fill="#FFFFFF", edge=ACCENT, fontsize=8.5)

    _arrow(ax, (pos_app[0], 70), (pos_comp[0], 63), color=ACCENT, fontsize=7)
    _arrow(ax, (pos_comp[0], 56), (pos_prop[0], 54), color=ACCENT)
    _arrow(ax, (pos_prop[0], 47), (pos_outl[0], 45), color=ACCENT)

    ax.text(82, 33, "Cấu trúc giống PMS:\nCompany → Property → Outlet",
            ha="center", fontsize=7, color=NEUTRAL, style="italic")

    # ----- Role layer (cross-cutting) -----
    role_box = _box(ax, 14, 17, 72, 10,
                    "ROLE & PERMISSION (Cross-cutting Configuration)",
                    sub="Mọi quan hệ User ↔ Department/Company/Property/Outlet đều cấu hình qua Role assignment",
                    fill=WARN_SOFT, edge=WARN, fontsize=10)

    # Arrows from each app's internal nodes down to role layer
    for src_x in (10, 25, 50, 82):
        _arrow(ax, (src_x, 32), (src_x, 27), color=WARN, curve=0)

    # ----- User layer -----
    user_box = _box(ax, 30, 4, 40, 8, "USER (Identity)",
                    sub="1 email = 1 identity · Có thể join nhiều Org",
                    fill=NEUTRAL_SOFT, edge=NEUTRAL, fontsize=10)
    _arrow(ax, (50, 17), (50, 12), "Role assigned to User", color=WARN, fontsize=8)

    # Side level labels
    ax.text(0.5, 90, "Cấp 0", fontsize=8.5, color=PRIMARY, fontweight="bold")
    ax.text(0.5, 73, "Cấp 1", fontsize=8.5, color=ACCENT, fontweight="bold")
    ax.text(0.5, 50, "Internal", fontsize=8.5, color=ACCENT, fontweight="bold")
    ax.text(0.5, 22, "Cấp 2", fontsize=8.5, color=WARN, fontweight="bold")
    ax.text(0.5, 8,  "Cấp 3", fontsize=8.5, color=NEUTRAL, fontweight="bold")

    return fig


def _swimlane(ax, lanes, top=88, bottom=10):
    """Draw vertical swimlanes. Returns dict of {name: x_center}."""
    n = len(lanes)
    width = 100 / n
    centers = {}
    for i, name in enumerate(lanes):
        x = i * width
        # header
        hdr = FancyBboxPatch((x + 2, top), width - 4, 6,
                             boxstyle="round,pad=0.02,rounding_size=0.4",
                             facecolor=PRIMARY, edgecolor=PRIMARY)
        ax.add_patch(hdr)
        ax.text(x + width / 2, top + 3, name, ha="center", va="center",
                fontsize=10, fontweight="bold", color="white")
        # vertical lifeline
        ax.plot([x + width / 2, x + width / 2], [top, bottom],
                color=LINE, linewidth=0.8, linestyle=":", zorder=0)
        centers[name] = x + width / 2
    return centers


def _msg(ax, src, dst, y, label, color=NEUTRAL, dashed=False, fontsize=8):
    arr = FancyArrowPatch(
        (src, y), (dst, y),
        arrowstyle="-|>", mutation_scale=10,
        color=color, linewidth=1.0,
        linestyle="--" if dashed else "-",
    )
    ax.add_patch(arr)
    mx = (src + dst) / 2
    ax.text(mx, y + 1.2, label, ha="center", va="bottom",
            fontsize=fontsize, color=color,
            bbox=dict(boxstyle="round,pad=0.15", fc=BG, ec="none", alpha=0.9))


def _note(ax, x, y, w, h, text, color=WARN_SOFT, edge=WARN, fontsize=8):
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle="round,pad=0.02,rounding_size=0.3",
                         facecolor=color, edgecolor=edge, linewidth=0.8)
    ax.add_patch(box)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fontsize, color=NEUTRAL, style="italic")


def render_auth_keycloak():
    fig, ax = _new_fig(12, 7.5)
    _title(ax, "Luồng Đăng nhập & SSO — Phương án Keycloak")
    lanes = _swimlane(ax, ["Browser", "Hub Web", "Keycloak", "Hub API", "Odoo"],
                      top=85, bottom=8)
    B, W, K, A, O = (lanes[k] for k in ["Browser", "Hub Web", "Keycloak", "Hub API", "Odoo"])

    y = 78
    step = 6
    _msg(ax, B, W, y, "1. Visit /"); y -= step
    _msg(ax, W, K, y, "2. OIDC redirect", color=SECONDARY); y -= step
    _msg(ax, K, B, y, "3. Login page", color=SECONDARY, dashed=True); y -= step
    _msg(ax, B, K, y, "4. Credentials", color=SECONDARY); y -= step
    _msg(ax, K, W, y, "5. ID Token (JWT)", color=SECONDARY, dashed=True); y -= step
    _msg(ax, W, A, y, "6. /auth/me + Token"); y -= step
    _msg(ax, A, W, y, "7. OrgMembership[]", dashed=True); y -= step
    _msg(ax, W, B, y, "8. → /select-org", color=ACCENT); y -= step
    _msg(ax, B, A, y, "9. POST /session/org", color=ACCENT); y -= step
    _msg(ax, A, B, y, "10. Hub JWT {org_id}", color=ACCENT, dashed=True); y -= step
    _msg(ax, B, A, y, "11. Click Odoo → /sso/odoo", color=WARN); y -= step
    _msg(ax, A, O, y, "12. SAML / one-time token", color=WARN); y -= step
    _msg(ax, O, B, y, "13. Redirect + session cookie", color=WARN, dashed=True)

    ax.text(50, 3, "Native SAML/OIDC: Keycloak có thể đẩy Token trực tiếp xuống Odoo",
            ha="center", fontsize=9, color=NEUTRAL, style="italic")
    return fig


def render_auth_clerk():
    fig, ax = _new_fig(12, 7.5)
    _title(ax, "Luồng Đăng nhập & SSO — Phương án Clerk (cần Identity Broker)")
    lanes = _swimlane(ax, ["Browser", "Hub Web", "Clerk Cloud", "Hub API", "Odoo"],
                      top=85, bottom=8)
    B, W, C, A, O = (lanes[k] for k in ["Browser", "Hub Web", "Clerk Cloud", "Hub API", "Odoo"])

    y = 78
    step = 6
    _msg(ax, B, W, y, "1. Visit /"); y -= step
    _msg(ax, W, C, y, "2. <SignIn /> modal", color=SECONDARY); y -= step
    _msg(ax, C, B, y, "3. Login UI", color=SECONDARY, dashed=True); y -= step
    _msg(ax, B, C, y, "4. Credentials", color=SECONDARY); y -= step
    _msg(ax, C, W, y, "5. JWT {org_id claim}", color=SECONDARY, dashed=True); y -= step
    _msg(ax, W, B, y, "6. <OrganizationSwitcher>", color=ACCENT); y -= step
    _msg(ax, B, C, y, "7. Pick Org → re-issue JWT", color=ACCENT); y -= step
    _msg(ax, B, A, y, "8. Click Odoo → /sso/odoo", color=WARN); y -= step

    # Identity broker note
    _note(ax, A - 8, y - 9, 16, 6,
          "Hub = Identity Broker:\nverify Clerk JWT,\ngenerate internal JWT (RS256)",
          color=WARN_SOFT, edge=WARN, fontsize=7)
    y -= 12
    _msg(ax, A, O, y, "9. Internal JWT auth", color=WARN); y -= step
    _msg(ax, O, B, y, "10. Session cookie", color=WARN, dashed=True)

    ax.text(50, 3, "Clerk không phát hành SAML → cần lớp Broker tại Hub (rủi ro & effort tăng 2-3 tuần)",
            ha="center", fontsize=9, color=WARN, style="italic")
    return fig


def render_provisioning():
    fig, ax = _new_fig(12, 7.5)
    _title(ax, "Luồng Provisioning & Cơ chế Retry / Dead Letter Queue")
    lanes = _swimlane(ax, ["Admin", "Hub API", "BullMQ Queue", "Odoo Driver", "Odoo App"],
                      top=85, bottom=8)
    AD, A, Q, D, O = (lanes[k] for k in ["Admin", "Hub API", "BullMQ Queue", "Odoo Driver", "Odoo App"])

    y = 78
    step = 5.5
    _msg(ax, AD, A, y, "1. Assign Role"); y -= step
    _msg(ax, A, Q, y, "2. Enqueue job", color=ACCENT); y -= step
    _msg(ax, A, AD, y, "3. 200 OK (async)", color=ACCENT, dashed=True); y -= step
    _msg(ax, Q, D, y, "4. Process job", color=ACCENT); y -= step

    # Success path
    _msg(ax, D, O, y, "5a. POST /api/users", color=ACCENT); y -= step
    _msg(ax, O, D, y, "5b. 200 OK", color=ACCENT, dashed=True); y -= step

    # Separator
    ax.plot([5, 95], [y - 1, y - 1], color=LINE, linestyle="--", linewidth=0.6)
    ax.text(50, y - 3, "── KỊCH BẢN LỖI ──", ha="center", fontsize=9,
            color=WARN, fontweight="bold")
    y -= 7

    _msg(ax, D, O, y, "6. POST /api/users", color=WARN); y -= step
    _msg(ax, O, D, y, "503 Timeout", color=WARN, dashed=True); y -= step
    _note(ax, D - 12, y - 8, 24, 7,
          "Retry x3 với backoff:\n30s → 2 phút → 10 phút",
          color=WARN_SOFT, edge=WARN, fontsize=7)
    y -= 11
    _msg(ax, D, Q, y, "Move to DLQ + Alert Admin", color=WARN, dashed=True)

    ax.text(50, 3, "Eventually-consistent: lệnh phân quyền không bao giờ bị mất",
            ha="center", fontsize=9, color=NEUTRAL, style="italic")
    return fig


def render_inter_app_comm():
    fig, ax = _new_fig(12, 8)
    _title(ax, "Giao tiếp Liên ứng dụng — Bảo mật & Khả năng Mở rộng", y=97)

    # DMZ zone (top)
    dmz = Rectangle((3, 65), 94, 25, facecolor="#FEF9C3",
                    edgecolor="#CA8A04", linewidth=1.0,
                    linestyle="--", alpha=0.35)
    ax.add_patch(dmz)
    ax.text(6, 87, "DMZ — Public Network", fontsize=9,
            color="#A16207", fontweight="bold", ha="left")

    # Private subnet (bottom)
    priv = Rectangle((3, 12), 94, 38, facecolor="#DBEAFE",
                     edgecolor="#1E40AF", linewidth=1.0,
                     linestyle="--", alpha=0.25)
    ax.add_patch(priv)
    ax.text(6, 47, "Private Subnet — Internal Network", fontsize=9,
            color="#1E40AF", fontweight="bold", ha="left")

    # IdP (DMZ - left)
    idp = _box(ax, 8, 70, 24, 12, "Keycloak / Clerk",
               sub="JWT issuer",
               fill=SECONDARY_SOFT, edge=SECONDARY, fontsize=10)

    # Hub API (DMZ - center)
    hub = _box(ax, 38, 70, 24, 12, "HUB API",
               sub="Stateless · Load-balanced",
               fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)

    # Apps (Private - separated with clear gaps)
    odoo = _box(ax, 6, 22, 22, 14, "Odoo Instances",
                sub="DB per Org",
                fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)
    pms = _box(ax, 39, 22, 22, 14, "PMS Instances",
               sub="DB per Org",
               fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)
    pos = _box(ax, 72, 22, 22, 14, "POS Instances",
               sub="DB per Org",
               fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)

    # IdP <-> Hub
    _arrow(ax, (32, 76), (38, 76), color=SECONDARY)
    ax.text(35, 79, "Verify JWT", ha="center", fontsize=8,
            color=SECONDARY, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.2", fc=BG, ec="none"))

    # Hub -> each app (clean vertical-ish arrows, no overlap)
    _arrow(ax, (45, 70), (17, 36), color=ACCENT, curve=-0.15)
    _arrow(ax, (50, 70), (50, 36), color=ACCENT)
    _arrow(ax, (55, 70), (83, 36), color=ACCENT, curve=0.15)

    # Service Account labels — placed in clear empty space
    ax.text(28, 56, "Service Acct\n(least privilege)", ha="center", fontsize=7.5,
            color=ACCENT, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.25", fc=BG, ec=ACCENT, lw=0.5))
    ax.text(53, 56, "Service Acct", ha="center", fontsize=7.5,
            color=ACCENT, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.25", fc=BG, ec=ACCENT, lw=0.5))
    ax.text(73, 56, "Service Acct", ha="center", fontsize=7.5,
            color=ACCENT, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.25", fc=BG, ec=ACCENT, lw=0.5))

    # "No direct app-to-app" prohibition — placed BELOW the apps with clear visibility
    prohibit = FancyBboxPatch((20, 14), 60, 5,
                              boxstyle="round,pad=0.02,rounding_size=0.5",
                              facecolor=WARN_SOFT, edgecolor=WARN,
                              linewidth=1.0, linestyle="--")
    ax.add_patch(prohibit)
    ax.text(50, 16.5, "✕  Cấm giao tiếp trực tiếp giữa các App — mọi tương tác phải đi qua Hub",
            ha="center", va="center", fontsize=8.5, color=WARN, fontweight="bold")

    ax.text(50, 5, "Mọi luồng đi qua Hub · Service Account least-privilege · Apps cô lập per-Org",
            ha="center", fontsize=9, color=NEUTRAL, style="italic")
    return fig


def render_keycloak_deploy():
    fig, ax = _new_fig(11, 6.5)
    _title(ax, "Triển khai Phương án Keycloak (Self-hosted)")

    _box(ax, 6, 55, 26, 22, "Keycloak", sub="Docker · Realm: kinex\nPostgreSQL (keycloak_db)",
         fill=SECONDARY_SOFT, edge=SECONDARY, fontsize=11)
    _box(ax, 38, 55, 26, 22, "hub-api", sub="NestJS · Prisma\nPostgreSQL (hub_db)",
         fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)
    _box(ax, 70, 55, 24, 22, "hub-web", sub="Next.js SSR",
         fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)

    _box(ax, 22, 22, 26, 18, "Redis (BullMQ)",
         sub="Provisioning queue",
         fill=NEUTRAL_SOFT, edge=NEUTRAL, fontsize=10)
    _box(ax, 54, 22, 30, 18, "App Instances",
         sub="Odoo · PMS · POS\n(per-Org databases)",
         fill=ACCENT_SOFT, edge=ACCENT, fontsize=10)

    _arrow(ax, (45, 55), (35, 40), color=PRIMARY)
    _arrow(ax, (51, 55), (69, 40), color=PRIMARY)
    _arrow(ax, (32, 66), (38, 66), "OIDC/SAML", color=SECONDARY, fontsize=8)

    ax.text(50, 8, "Hạ tầng nội bộ · Toàn quyền dữ liệu · Chi phí ổn định khi scale",
            ha="center", fontsize=9, color=NEUTRAL, style="italic")
    return fig


def render_clerk_deploy():
    fig, ax = _new_fig(11, 6.5)
    _title(ax, "Triển khai Phương án Clerk (Managed SaaS)")

    cloud = FancyBboxPatch((4, 55), 28, 25,
                           boxstyle="round,pad=0.02,rounding_size=1.5",
                           facecolor=SECONDARY_SOFT, edgecolor=SECONDARY,
                           linewidth=1.5, linestyle="--")
    ax.add_patch(cloud)
    ax.text(18, 73, "Clerk Cloud", ha="center", fontsize=11,
            fontweight="bold", color=SECONDARY)
    ax.text(18, 67, "(US / EU)", ha="center", fontsize=8, color=SECONDARY)
    ax.text(18, 62, "Users · Orgs · Sessions", ha="center", fontsize=8, color=NEUTRAL)

    _box(ax, 38, 55, 26, 22, "hub-api", sub="NestJS · Prisma\nIdentity Broker",
         fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)
    _box(ax, 70, 55, 24, 22, "hub-web", sub="Next.js + @clerk/nextjs",
         fill=PRIMARY_SOFT, edge=PRIMARY, fontsize=11)

    _box(ax, 22, 22, 26, 18, "Hub DB",
         sub="PostgreSQL · OrgMembership",
         fill=NEUTRAL_SOFT, edge=NEUTRAL, fontsize=10)
    _box(ax, 54, 22, 30, 18, "Odoo / PMS / POS",
         sub="Custom JWT bridge",
         fill=WARN_SOFT, edge=WARN, fontsize=10)

    _arrow(ax, (32, 66), (38, 66), "JWKS / Webhooks", color=SECONDARY, fontsize=8)
    _arrow(ax, (45, 55), (35, 40), color=PRIMARY)
    _arrow(ax, (55, 55), (69, 40), "Internal JWT", color=WARN, fontsize=8)

    ax.text(50, 8, "Tốc độ triển khai cao · Phụ thuộc cloud · Cần Identity Broker cho Odoo",
            ha="center", fontsize=9, color=WARN, style="italic")
    return fig


RENDERERS = {
    "hub-spoke":       render_hub_spoke,
    "hierarchy":       render_hierarchy,
    "auth-keycloak":   render_auth_keycloak,
    "auth-clerk":      render_auth_clerk,
    "provisioning":    render_provisioning,
    "inter-app-comm":  render_inter_app_comm,
    "keycloak-deploy": render_keycloak_deploy,
    "clerk-deploy":    render_clerk_deploy,
}


# --- DOCX helpers ----------------------------------------------------------
def set_paragraph_border(paragraph, color="AAAAAA", size=4):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    for side in ('top', 'left', 'bottom', 'right'):
        b = OxmlElement(f'w:{side}')
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), str(size))
        b.set(qn('w:space'), '4')
        b.set(qn('w:color'), color)
        pBdr.append(b)
    pPr.append(pBdr)


def set_paragraph_shading(paragraph, fill="F5F5F5"):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    pPr.append(shd)


def add_diagram_image(doc, renderer_name, tmp_dir):
    fig = RENDERERS[renderer_name]()
    path = os.path.join(tmp_dir, f"{renderer_name}.png")
    fig.savefig(path, dpi=180, bbox_inches="tight", facecolor=BG, pad_inches=0.15)
    plt.close(fig)

    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(path, width=Inches(6.3))
    doc.add_paragraph()


def add_ascii_fallback(doc, lines):
    doc.add_paragraph()
    label = doc.add_paragraph()
    r = label.add_run("[ DIAGRAM ]")
    r.font.size = Pt(8)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    label.paragraph_format.space_after = Pt(0)
    for line in lines:
        p = doc.add_paragraph()
        run = p.add_run(line if line else " ")
        run.font.name = "Courier New"
        run.font.size = Pt(8)
        run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.left_indent = Inches(0.2)
        set_paragraph_shading(p, fill="F0F4F8")
        set_paragraph_border(p, color="AACCEE", size=2)
    doc.add_paragraph()


def add_code_block(doc, lines):
    doc.add_paragraph()
    for line in lines:
        p = doc.add_paragraph()
        run = p.add_run(line if line else " ")
        run.font.name = "Courier New"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(0x2D, 0x2D, 0x2D)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.left_indent = Inches(0.2)
        set_paragraph_shading(p, fill="F3F3F3")
    doc.add_paragraph()


def apply_inline_bold(paragraph, text):
    parts = re.split(r'\*\*(.*?)\*\*', text)
    for i, part in enumerate(parts):
        if not part:
            continue
        r = paragraph.add_run(part)
        if i % 2 == 1:
            r.bold = True


# --- Main converter --------------------------------------------------------
def markdown_to_docx(md_path, docx_path):
    if not os.path.exists(md_path):
        print(f"Không tìm thấy file: {md_path}")
        return

    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_table = False
    table_data = []
    in_code_block = False
    code_block_lines = []
    code_block_kind = "code"   # "diagram-image" | "diagram-ascii" | "code"
    diagram_name = None

    tmp_dir = tempfile.mkdtemp(prefix="md2docx_")

    i = 0
    while i < len(lines):
        original_line = lines[i].rstrip()
        line = original_line.strip()

        # Code/diagram fence
        if line.startswith('```'):
            if not in_code_block:
                tag = line[3:].strip()
                tokens = tag.split()
                lang = tokens[0].lower() if tokens else ""
                name = tokens[1].lower() if len(tokens) > 1 else None

                in_code_block = True
                code_block_lines = []
                diagram_name = None
                if lang == "diagram":
                    if name and name in RENDERERS:
                        code_block_kind = "diagram-image"
                        diagram_name = name
                    else:
                        code_block_kind = "diagram-ascii"
                else:
                    code_block_kind = "code"
            else:
                in_code_block = False
                if code_block_kind == "diagram-image":
                    add_diagram_image(doc, diagram_name, tmp_dir)
                elif code_block_kind == "diagram-ascii":
                    add_ascii_fallback(doc, code_block_lines)
                else:
                    add_code_block(doc, code_block_lines)
                code_block_lines = []
            i += 1
            continue

        if in_code_block:
            code_block_lines.append(original_line)
            i += 1
            continue

        # Tables
        if line.startswith('|'):
            if '---' in line and '|' in line:
                i += 1
                continue
            in_table = True
            cells = [c.strip() for c in original_line.split('|')]
            if original_line.startswith('|'):
                cells = cells[1:]
            if original_line.endswith('|'):
                cells = cells[:-1]
            if cells:
                table_data.append(cells)
            i += 1
            continue
        else:
            if in_table:
                if table_data:
                    num_rows = len(table_data)
                    num_cols = max(len(r) for r in table_data)
                    table = doc.add_table(rows=num_rows, cols=num_cols)
                    table.style = 'Table Grid'
                    for ri, row_data in enumerate(table_data):
                        for ci, cell_text in enumerate(row_data):
                            if ci < num_cols:
                                clean_cell = re.sub(r'\*\*(.*?)\*\*', r'\1', cell_text)
                                clean_cell = clean_cell.replace('__', '')
                                cell = table.cell(ri, ci)
                                cell.text = clean_cell
                                if ri == 0:
                                    for run in cell.paragraphs[0].runs:
                                        run.bold = True
                    doc.add_paragraph()
                table_data = []
                in_table = False

        # Headings
        if line.startswith('#### '):
            doc.add_heading(line[5:], level=3)
        elif line.startswith('### '):
            doc.add_heading(line[4:], level=2)
        elif line.startswith('## '):
            doc.add_heading(line[3:], level=1)
        elif line.startswith('# '):
            doc.add_heading(line[2:], level=0)
        elif line == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
        elif line.startswith('- ') or line.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            apply_inline_bold(p, line[2:])
        elif re.match(r'^\d+\.\s', line):
            p = doc.add_paragraph(style='List Number')
            text = re.sub(r'^\d+\.\s+', '', line)
            apply_inline_bold(p, text)
        elif original_line.startswith('    - ') or original_line.startswith('\t- '):
            text = line.lstrip('-').strip()
            p = doc.add_paragraph(style='List Bullet 2')
            apply_inline_bold(p, text)
        elif line.startswith('_(') or (line.startswith('_') and line.endswith('_')):
            p = doc.add_paragraph()
            r = p.add_run(line.strip('_'))
            r.italic = True
            r.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        elif line:
            p = doc.add_paragraph()
            apply_inline_bold(p, line)

        i += 1

    if in_table and table_data:
        num_rows = len(table_data)
        num_cols = max(len(r) for r in table_data)
        table = doc.add_table(rows=num_rows, cols=num_cols)
        table.style = 'Table Grid'
        for ri, row_data in enumerate(table_data):
            for ci, cell_text in enumerate(row_data):
                if ci < num_cols:
                    clean_cell = re.sub(r'\*\*(.*?)\*\*', r'\1', cell_text)
                    table.cell(ri, ci).text = clean_cell

    doc.save(docx_path)
    print(f"Đã chuyển đổi thành công: {docx_path}")


if __name__ == "__main__":
    INPUT_FILE = "docs/UNIFIED_WORKSPACE_PROPOSAL.md"
    OUTPUT_FILE = "docs/UNIFIED_WORKSPACE_PROPOSAL.docx"
    markdown_to_docx(INPUT_FILE, OUTPUT_FILE)
