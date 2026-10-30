import os
from PIL import Image, ImageDraw, ImageFont

# Set up canvas
WIDTH, HEIGHT = 2400, 1600
img = Image.new("RGBA", (WIDTH, HEIGHT), (15, 23, 42, 255)) # Deep navy background (#0f172a)
draw = ImageDraw.Draw(img)

# Helper function to get fonts safely
def get_font(size, bold=False):
    # Try Windows system fonts
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf",
    ]
    for path in font_names:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                pass
    return ImageFont.load_default()

title_font = get_font(48, bold=True)
subtitle_font = get_font(24, bold=False)
section_font = get_font(28, bold=True)
card_title_font = get_font(24, bold=True)
body_font = get_font(18, bold=False)
small_font = get_font(15, bold=False)
badge_font = get_font(16, bold=True)

# Draw Title Header Box
draw.rounded_rectangle([60, 40, WIDTH - 60, 140], radius=15, fill=(30, 41, 59, 255), outline=(59, 130, 246, 255), width=2)
draw.text((90, 55), "LostLink — Scaled Cloud Architecture with Elastic Cloud Bursting", fill=(255, 255, 255, 255), font=title_font)
draw.text((90, 108), "Assignment 3, Question 1(d) | Three Docker Backends + Nginx Load Balancer (Port 8080) + Cloud Bursting Component", fill=(148, 163, 184, 255), font=subtitle_font)

# Helper for drawing cards
def draw_card(box, title, subtitle, details, bg_color, border_color, border_width=2, badge=None, badge_color=None):
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=16, fill=bg_color, outline=border_color, width=border_width)
    
    # Title
    draw.text((x0 + 20, y0 + 18), title, fill=(255, 255, 255, 255), font=card_title_font)
    
    # Optional Badge
    if badge and badge_color:
        tw = draw.textlength(badge, font=badge_font)
        bx0 = x1 - tw - 35
        by0 = y0 + 16
        bx1 = x1 - 15
        by1 = y0 + 44
        draw.rounded_rectangle([bx0, by0, bx1, by1], radius=8, fill=badge_color)
        draw.text((bx0 + 10, by0 + 4), badge, fill=(255, 255, 255, 255), font=badge_font)

    # Subtitle
    if subtitle:
        draw.text((x0 + 20, y0 + 52), subtitle, fill=(148, 163, 184, 255), font=small_font)
    
    # Separator line
    draw.line([(x0 + 20, y0 + 78), (x1 - 20, y0 + 78)], fill=(255, 255, 255, 30), width=1)
    
    # Details lines
    curr_y = y0 + 90
    for line in details:
        draw.text((x0 + 20, curr_y), line, fill=(203, 213, 225, 255), font=body_font)
        curr_y += 24

# ── 1. Client Tier ──
draw.text((80, 165), "1. CLIENT & PRESENTATION TIER", fill=(56, 189, 248, 255), font=section_font)

draw_card(
    box=[80, 205, 540, 420],
    title="Campus Students & Staff",
    subtitle="Client Layer (Mobile & Desktop Web)",
    details=[
        "• 10,000+ campus students",
        "• High read-spike during hostel vacating",
        "• Generates up to 50,000 HTTP requests",
        "• Targets /api/items & /api/health"
    ],
    bg_color=(30, 41, 59, 255),
    border_color=(59, 130, 246, 255),
    badge="CLIENTS",
    badge_color=(37, 99, 235, 255)
)

draw_card(
    box=[580, 205, 1140, 420],
    title="LostLink React 18 SPA (Vite)",
    subtitle="Hosted on Vercel Global Edge Network",
    details=[
        "• URL: https://lost-link-ten.vercel.app",
        "• Protocol: HTTPS | Port: 443",
        "• Global Anycast CDN Edge Distribution",
        "• Dispatches API calls to Nginx Load Balancer"
    ],
    bg_color=(15, 23, 42, 255),
    border_color=(6, 182, 212, 255),
    badge="VERCEL CDN",
    badge_color=(8, 145, 178, 255)
)

# Assignment 1 Cloud Platform Box
draw_card(
    box=[1180, 205, 1740, 420],
    title="Render Web Service (Assignment 1)",
    subtitle="Original Production Cloud Host",
    details=[
        "• URL: https://lostlink-6ree.onrender.com",
        "• Port: 443 (HTTPS)",
        "• Node.js + Express Single Instance",
        "• Baseline cloud reference from Digital Assignment 1"
    ],
    bg_color=(30, 41, 59, 255),
    border_color=(156, 163, 175, 255),
    badge="ASSIGNMENT 1",
    badge_color=(75, 85, 99, 255)
)

# ── 2. Ingress & Load Balancing Tier ──
draw.text((80, 455), "2. LOAD BALANCING & INGRESS TIER (Port 8080)", fill=(52, 211, 153, 255), font=section_font)

draw_card(
    box=[80, 495, 1740, 715],
    title="Nginx Reverse Proxy & Resilient Load Balancer (lostlink-nginx)",
    subtitle="Official nginx:1.27-alpine Docker Container | Host Port: 8080 ➔ Container Port: 80",
    details=[
        "• Upstream Primary Cluster: Round-Robin across backend1, backend2, backend3 (Port 5000)",
        "• Upstream Cloud Burst Tier: Active proxy to backend-burst (Port 5000) when surge threshold exceeded",
        "• Dynamic Upstream Selection: Routes based on load threshold / header ($http_x_lostlink_burst)",
        "• Zero-Downtime Failover Policy: proxy_next_upstream error timeout http_500 http_502 http_503 http_504",
        "• Transparent Fallback: Automatically shifts traffic to primary nodes if burst container stops (0% failures)"
    ],
    bg_color=(6, 78, 59, 220),
    border_color=(16, 185, 129, 255),
    border_width=3,
    badge="NGINX : 8080",
    badge_color=(5, 150, 105, 255)
)

# ── 3. Application Logic & Elastic Bursting Tier ──
draw.text((80, 750), "3. APPLICATION LOGIC TIER — PRIMARY CLUSTER VS CLOUD BURSTING COMPONENT", fill=(251, 191, 36, 255), font=section_font)

# Primary Backend 1
draw_card(
    box=[80, 795, 580, 1070],
    title="lostlink-backend1",
    subtitle="Primary Docker Instance 1 | Node.js + Express",
    details=[
        "• Internal Port: 5000",
        "• Header: X-LostLink-Instance=backend1",
        "• Connected to MongoDB Atlas",
        "• Baseline traffic allocation: 33.3%",
        "• State: Active (Production)"
    ],
    bg_color=(23, 37, 84, 230),
    border_color=(56, 189, 248, 255),
    badge="PRIMARY 1",
    badge_color=(2, 132, 199, 255)
)

# Primary Backend 2
draw_card(
    box=[620, 795, 1120, 1070],
    title="lostlink-backend2",
    subtitle="Primary Docker Instance 2 | Node.js + Express",
    details=[
        "• Internal Port: 5000",
        "• Header: X-LostLink-Instance=backend2",
        "• Connected to MongoDB Atlas",
        "• Baseline traffic allocation: 33.3%",
        "• State: Active (Production)"
    ],
    bg_color=(23, 37, 84, 230),
    border_color=(56, 189, 248, 255),
    badge="PRIMARY 2",
    badge_color=(2, 132, 199, 255)
)

# Primary Backend 3
draw_card(
    box=[1160, 795, 1660, 1070],
    title="lostlink-backend3",
    subtitle="Primary Docker Instance 3 | Node.js + Express",
    details=[
        "• Internal Port: 5000",
        "• Header: X-LostLink-Instance=backend3",
        "• Connected to MongoDB Atlas",
        "• Baseline traffic allocation: 33.3%",
        "• State: Active (Production)"
    ],
    bg_color=(23, 37, 84, 230),
    border_color=(56, 189, 248, 255),
    badge="PRIMARY 3",
    badge_color=(2, 132, 199, 255)
)

# ── 4. CLOUD BURSTING COMPONENT (HIGHLIGHTED IN VIBRANT PURPLE) ──
draw_card(
    box=[1700, 795, 2320, 1070],
    title="lostlink-backend-burst",
    subtitle="CLOUD BURSTING COMPONENT (Question 1d)",
    details=[
        "• Simulated Elastic Cloud Instance",
        "• Internal Port: 5000",
        "• Header: X-LostLink-Instance=backend-burst",
        "• Auto-engaged when load > 100 req/sec",
        "• Absorbs peak hostel vacating read-surge",
        "• Shared Cloud DB with Zero State Loss",
        "• Seamless fallback to Primary 1-3 if offline"
    ],
    bg_color=(76, 29, 149, 240),
    border_color=(192, 132, 252, 255),
    border_width=4,
    badge="CLOUD BURSTING",
    badge_color=(147, 51, 234, 255)
)

# ── 5. Persistent Cloud Data Tier ──
draw.text((80, 1110), "4. SHARED PERSISTENT DATA & MEDIA TIER (Cloud Infrastructure)", fill=(244, 114, 182, 255), font=section_font)

draw_card(
    box=[80, 1150, 1300, 1420],
    title="MongoDB Atlas (Cluster0)",
    subtitle="Managed Cloud NoSQL Database | AWS ap-south-1 (Mumbai) Region",
    details=[
        "• Port: 27017 (TLS Encrypted SRV Connection)",
        "• Collections: users, items, claims (Atomic ACID Transactions)",
        "• Shared by All 3 Primary Backends AND the Elastic Cloud Bursting Instance",
        "• Guaranteed Data Consistency: All item reports and ownership claims persist centrally",
        "• IP Whitelist: Configured for secure access (0.0.0.0/0 dynamic cloud ingress)"
    ],
    bg_color=(69, 26, 3, 230),
    border_color=(245, 158, 11, 255),
    badge="SHARED CLOUD DB",
    badge_color=(217, 119, 6, 255)
)

draw_card(
    box=[1340, 1150, 2320, 1420],
    title="Cloudinary Media Storage & CDN",
    subtitle="Cloud Name: v6e9uxyo | Global Asset CDN Delivery",
    details=[
        "• Port: 443 (HTTPS Secure Upload & Fetch)",
        "• Folder: lostlink/ (auto-categorized by lost, found, profile)",
        "• Auto-Optimization: Max 1200x1200 WebP format for fast student browsing",
        "• Decouples media assets from database and backend storage",
        "• Direct CDN caching for zero backend image serving overhead"
    ],
    bg_color=(76, 5, 25, 230),
    border_color=(244, 114, 182, 255),
    badge="MEDIA CDN",
    badge_color=(219, 39, 119, 255)
)

# ── Draw Connection Arrows & Indicators ──
def draw_arrow(start, end, color, width=3, text=None, text_color=(255, 255, 255, 255)):
    x0, y0 = start
    x1, y1 = end
    draw.line([start, end], fill=color, width=width)
    # Draw arrow head
    if x0 == x1: # Vertical
        dy = 8 if y1 > y0 else -8
        draw.polygon([(x1, y1), (x1 - 6, y1 - dy), (x1 + 6, y1 - dy)], fill=color)
    elif y0 == y1: # Horizontal
        dx = 8 if x1 > x0 else -8
        draw.polygon([(x1, y1), (x1 - dx, y1 - 6), (x1 - dx, y1 + 6)], fill=color)
    if text:
        mx = (x0 + x1) // 2
        my = (y0 + y1) // 2
        draw.text((mx + 8, my - 10), text, fill=text_color, font=small_font)

# Client to Frontend
draw_arrow((540, 312), (580, 312), color=(56, 189, 248, 255), width=3, text="1. HTTPS")

# Frontend to Nginx
draw_arrow((860, 420), (860, 495), color=(52, 211, 153, 255), width=3, text="2. REST API")

# Nginx to Backends
draw_arrow((330, 715), (330, 795), color=(56, 189, 248, 255), width=3, text="3a. Round-Robin")
draw_arrow((870, 715), (870, 795), color=(56, 189, 248, 255), width=3, text="3b. Round-Robin")
draw_arrow((1410, 715), (1410, 795), color=(56, 189, 248, 255), width=3, text="3c. Round-Robin")

# Nginx to Cloud Burst (Vivid Purple Arrow)
draw_arrow((1740, 605), (2010, 605), color=(192, 132, 252, 255), width=4)
draw_arrow((2010, 605), (2010, 795), color=(192, 132, 252, 255), width=4, text="4. PEAK SURGE CLOUD BURST (> 100 req/s)", text_color=(216, 180, 254, 255))

# Backends to Database
draw_arrow((330, 1070), (330, 1150), color=(245, 158, 11, 255), width=3)
draw_arrow((870, 1070), (870, 1150), color=(245, 158, 11, 255), width=3)
draw_arrow((1230, 1070), (1230, 1150), color=(245, 158, 11, 255), width=3)
draw_arrow((2010, 1070), (2010, 1110), color=(192, 132, 252, 255), width=3)
draw.line([(2010, 1110), (1100, 1110)], fill=(192, 132, 252, 255), width=3)
draw_arrow((1100, 1110), (1100, 1150), color=(192, 132, 252, 255), width=3, text="Shared Mongoose Connection Pool", text_color=(216, 180, 254, 255))

# Footer notes
draw.rounded_rectangle([60, 1450, WIDTH - 60, 1560], radius=12, fill=(30, 41, 59, 255), outline=(100, 116, 139, 255), width=1)
draw.text((80, 1465), "Architectural Notes for Assignment 3 Question 1(d):", fill=(255, 255, 255, 255), font=badge_font)
draw.text((80, 1495), "• Normal Demand (< 100 req/s): Traffic is evenly balanced across lostlink-backend1, backend2, backend3 via Nginx round-robin.", fill=(203, 213, 225, 255), font=small_font)
draw.text((80, 1525), "• Peak Demand Surge: Dynamic threshold routes eligible overflow traffic to lostlink-backend-burst (highlighted in purple) without database replication lag.", fill=(192, 132, 252, 255), font=small_font)

# Save image
out_path = os.path.join("docs", "lostlink-assignment-3-q1d-architecture.png")
img.save(out_path, "PNG", dpi=(300, 300))
print(f"Successfully generated: {out_path} ({WIDTH}x{HEIGHT})")
