// app.js

// Global State
const checklistData = {
    pre: { total: 4, checked: 0 },
    day: { total: 4, checked: 0 },
    post: { total: 4, checked: 0 }
};

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    updateReelsValue();
    calculateProposal();
    initCalendar();
});

// ==========================================
// CHECKLIST LOGIC
// ==========================================

function initChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    
    // Set total counts
    const sections = ['pre', 'day', 'post'];
    sections.forEach(sec => {
        const secCheckboxes = document.querySelectorAll(`.checklist-item input[data-section="${sec}"]`);
        checklistData[sec].total = secCheckboxes.length;
        document.getElementById(`badge-${sec}`).textContent = secCheckboxes.length;
    });

    updateProgress();
}

function toggleTask(itemElement, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    
    // Prevent double toggling if clicked directly on the checkbox/checkmark
    if (window.event && window.event.target.tagName !== 'INPUT' && window.event.target.className !== 'checkmark') {
        checkbox.checked = !checkbox.checked;
    }
    
    // Toggle active class on container
    if (checkbox.checked) {
        itemElement.classList.add('checked');
    } else {
        itemElement.classList.remove('checked');
    }
    
    updateProgress();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const total = checkboxes.length;
    let checkedCount = 0;
    
    const sectionChecked = { pre: 0, day: 0, post: 0 };
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            checkedCount++;
            const section = cb.getAttribute('data-section');
            if (sectionChecked[section] !== undefined) {
                sectionChecked[section]++;
            }
        }
    });
    
    // Update labels and progress bar
    document.getElementById('checked-count').textContent = checkedCount;
    document.getElementById('total-count').textContent = total;
    
    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    document.getElementById('progress-pct').textContent = `${percentage}%`;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    
    // Update tab badges to show checked / total
    const sections = ['pre', 'day', 'post'];
    sections.forEach(sec => {
        const totalSec = checklistData[sec].total;
        const checkedSec = sectionChecked[sec];
        document.getElementById(`badge-${sec}`).textContent = `${checkedSec}/${totalSec}`;
    });
}

function switchTab(tabId) {
    // Hide all panes
    const panes = document.querySelectorAll('.checklist-pane');
    panes.forEach(pane => pane.classList.remove('active'));
    
    // Deactivate all buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show active pane and button
    document.getElementById(tabId).classList.add('active');
    
    // Find button that switches to this tab
    const activeBtn = Array.from(tabBtns).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// ==========================================
// CALCULATOR LOGIC
// ==========================================

function updateReelsValue() {
    const slider = document.getElementById('post-reels');
    const countSpan = document.getElementById('reels-count');
    countSpan.textContent = slider.value;
}

function calculateProposal() {
    let total = 0;
    const summaryItemsList = document.getElementById('summary-items-list');
    summaryItemsList.innerHTML = '';
    
    const items = [
        // Production
        { id: 'prod-director', name: 'On-Ground Director & Producer', type: 'checkbox' },
        { id: 'prod-cameraman', name: 'Local Chennai Videographer', type: 'checkbox' },
        { id: 'prod-gear', name: 'Equipment & Logistics (Chennai)', type: 'checkbox' },
        // Tech
        { id: 'tech-funnel', name: 'Comment-to-DM Registration Funnel', type: 'checkbox' },
        // Post-Production
        { id: 'post-film', name: 'Master Event Film (60–90s)', type: 'checkbox' },
        { id: 'post-reels', name: 'Testimonial Reels', type: 'slider', pricePerUnit: 7500 },
        { id: 'post-partner', name: 'Partner Recap Kits & Footage Access', type: 'checkbox' },
        // Upgrades
        { id: 'opt-ads', name: 'Meta Ads Management', type: 'checkbox' },
        { id: 'opt-influencer', name: 'Influencer Joint Posting', type: 'checkbox' }
    ];
    
    // We add a Project Management & Coordination Fee of Rs. 25,000 by default to reach Rs. 2,20,000 exactly
    // with the default options checked.
    const baseManagementFee = 25000;
    total += baseManagementFee;
    
    // Append management fee to summary
    appendSummaryItem(summaryItemsList, 'Base Management & Coordination Fee', baseManagementFee);

    items.forEach(item => {
        if (item.type === 'checkbox') {
            const el = document.getElementById(item.id);
            if (el && el.checked) {
                const price = parseInt(el.getAttribute('data-price')) || 0;
                total += price;
                appendSummaryItem(summaryItemsList, item.name, price);
            }
        } else if (item.type === 'slider') {
            const el = document.getElementById(item.id);
            if (el) {
                const count = parseInt(el.value) || 0;
                if (count > 0) {
                    const price = count * item.pricePerUnit;
                    total += price;
                    appendSummaryItem(summaryItemsList, `${item.name} (x${count})`, price);
                }
            }
        }
    });
    
    // Update total display
    document.getElementById('calc-total').textContent = `Rs. ${total.toLocaleString('en-IN')}`;
    
    // Target budget check (Rs. 2,20,000)
    const targetBudget = 220000;
    const markerBox = document.getElementById('target-marker');
    const markerIcon = document.getElementById('target-icon');
    const markerText = document.getElementById('target-text');
    
    if (total === targetBudget) {
        markerBox.className = 'target-marker-box target-match';
        markerIcon.className = 'fa-solid fa-circle-check';
        markerText.innerHTML = `Target match: <strong>Rs. 2.2 Lakh</strong> budget satisfied.`;
    } else if (total < targetBudget) {
        const diff = targetBudget - total;
        markerBox.className = 'target-marker-box target-under';
        markerIcon.className = 'fa-solid fa-circle-minus';
        markerText.innerHTML = `Under budget: <strong>Rs. ${diff.toLocaleString('en-IN')}</strong> remaining of the Rs. 2.2L limit.`;
    } else {
        const diff = total - targetBudget;
        markerBox.className = 'target-marker-box target-over';
        markerIcon.className = 'fa-solid fa-triangle-exclamation';
        markerText.innerHTML = `Over budget: Exceeds target by <strong>Rs. ${diff.toLocaleString('en-IN')}</strong>.`;
    }
}

function appendSummaryItem(parent, name, price) {
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `
        <span>${name}</span>
        <span>Rs. ${price.toLocaleString('en-IN')}</span>
    `;
    parent.appendChild(row);
}

// ==========================================
// PROPOSAL COPY & MODAL LOGIC
// ==========================================

function openProposalTextModal() {
    const modal = document.getElementById('proposal-modal');
    const textarea = document.getElementById('proposal-raw-text');
    
    // Build formatted text
    let total = 0;
    let text = `====================================================\n`;
    text += `SAKURA QUEST 2026 — CHENNAI ROADSHOW PILOT PROPOSAL\n`;
    text += `====================================================\n\n`;
    text += `Client Target Budget: Rs. 2,20,000 (INR)\n`;
    text += `Event Location: IndiQube Wave, Chennai\n`;
    text += `Event Date: June 21, 2026\n\n`;
    text += `SELECTED SERVICES BREAKDOWN:\n`;
    text += `----------------------------------------------------\n`;
    
    // Add items
    const baseManagementFee = 25000;
    total += baseManagementFee;
    text += `• Base Management & Coordination Fee: Rs. 25,000\n`;
    
    const checkboxes = [
        { id: 'prod-director', name: 'On-Ground Director & Producer', price: 25000 },
        { id: 'prod-cameraman', name: 'Local Chennai Videographer', price: 20000 },
        { id: 'prod-gear', name: 'Equipment & Logistics (Chennai)', price: 20000 },
        { id: 'tech-funnel', name: 'Comment-to-DM Registration Funnel', price: 10000 },
        { id: 'post-film', name: 'Master Event Film (60–90s)', price: 35000 },
        { id: 'post-partner', name: 'Partner Recap Kits & Footage Access', price: 15000 },
        { id: 'opt-ads', name: 'Meta Ads Management (Upgrade)', price: 25000 },
        { id: 'opt-influencer', name: 'Influencer Joint Posting (Upgrade)', price: 40000 }
    ];
    
    checkboxes.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.checked) {
            total += item.price;
            text += `• ${item.name}: Rs. ${item.price.toLocaleString('en-IN')}\n`;
        }
    });
    
    const reelsSlider = document.getElementById('post-reels');
    if (reelsSlider) {
        const count = parseInt(reelsSlider.value) || 0;
        if (count > 0) {
            const price = count * 7500;
            total += price;
            text += `• Testimonial Reels (x${count}): Rs. ${price.toLocaleString('en-IN')} (at Rs. 7,500/reel)\n`;
        }
    }
    
    text += `----------------------------------------------------\n`;
    text += `TOTAL VALUE: Rs. ${total.toLocaleString('en-IN')}\n`;
    text += `====================================================\n\n`;
    text += `Thank you for your consideration.\n`;
    text += `Talkxo — Content & Digital Support for Education Japan, India.`;
    
    textarea.value = text;
    modal.classList.add('active');
}

function closeProposalTextModal(event) {
    const modal = document.getElementById('proposal-modal');
    modal.classList.remove('active');
}

function copyProposalToClipboard() {
    const textarea = document.getElementById('proposal-raw-text');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(textarea.value).then(() => {
        showToast("Proposal text copied to clipboard!");
        closeProposalTextModal();
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast("Failed to copy. Please copy manually.");
    });
}

function showToast(message) {
    const toast = document.getElementById('toast-notify');
    const toastText = document.getElementById('toast-text');
    toastText.textContent = message;
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ==========================================
// 30-DAY TIMELINE CALENDAR LOGIC
// ==========================================

const campaignDays = [
    // Phase 1: Planning & Strategy (Days 1-10)
    {
        day: 1,
        title: "Campaign Kickoff & Local Crew Sourcing",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Define baseline campaign KPIs, align student/parent target segments, and source local videographers and production crew in Chennai.",
        tasks: [
            "Confirm videographer/director availability for June 21st",
            "Establish Google Drive shared workspace for asset cataloging",
            "Establish slack/whatsapp crew communication lines"
        ],
        owner: "On-Ground Director",
        duration: "Day 1 of 30"
    },
    {
        day: 2,
        title: "Stakeholder Audience Mapping",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Analyze specific concerns for the Chennai demographic. Refine positioning for Student, Parent, and Counsellor streams.",
        tasks: [
            "Draft audience pain points (safety, placement, cost)",
            "Align university-specific value propositions"
        ],
        owner: "Campaign Lead",
        duration: "Day 2 of 30"
    },
    {
        day: 3,
        title: "Vox-Pop Interview Scripting & Storyboards",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Create standard questionnaires and interview storyboards for on-site execution targeting students, parents, and counsellors.",
        tasks: [
            "Write 5 questions for students (cultural appeal vs career)",
            "Write 5 questions for parents (employability/security)",
            "Draft counsellor feedback questions"
        ],
        owner: "Content Director",
        duration: "Day 3 of 30"
    },
    {
        day: 4,
        title: "ManyChat Comment-to-DM Design",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Design the conversation flow structure for Instagram and WhatsApp registration funnels to hook leads via automated lead baits.",
        tasks: [
            "Map 'JAPAN' comment trigger logic",
            "Draft initial welcome and scholarship PDF delivery copy"
        ],
        owner: "Automation Engineer",
        duration: "Day 4 of 30"
    },
    {
        day: 5,
        title: "Lead Capture Magnet Drafting",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Finalize the lead magnet content (e.g., '2026 Japan Scholarship & Admissions Guide') that ManyChat will distribute to comments.",
        tasks: [
            "Compile factsheet on Japanese scholarships",
            "Format the PDF guide as a premium branded download"
        ],
        owner: "Creative Copywriter",
        duration: "Day 5 of 30"
    },
    {
        day: 6,
        title: "Meta Ads Copy & Creatives",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Prepare creative copy, image/video templates, and call-to-action details for targeted lead-generation Meta ads.",
        tasks: [
            "Write ad copies for parent and student streams",
            "Design visual templates for localized Facebook/Instagram ads"
        ],
        owner: "Media Buyer",
        duration: "Day 6 of 30"
    },
    {
        day: 7,
        title: "Meta Ads Setup & Target Configuration",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Configure targeted campaign variables on Meta Ads Manager focusing on local Chennai parents and students.",
        tasks: [
            "Set audience targeting (interests in study-abroad, demographics)",
            "Load creatives and configure budget thresholds"
        ],
        owner: "Media Buyer",
        duration: "Day 7 of 30"
    },
    {
        day: 8,
        title: "ManyChat Setup & Webhook Integration",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Implement ManyChat triggers in live social media test environments. Integrate lead sheets via Zapier.",
        tasks: [
            "Deploy ManyChat automation rules for comment capture",
            "Connect ManyChat lead exports to master Google Sheet"
        ],
        owner: "Automation Engineer",
        duration: "Day 8 of 30"
    },
    {
        day: 9,
        title: "Crew Alignment & Shoot Preparation",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Hold alignment briefings with the Chennai film crew on camera settings, lighting requirements, and raw footage transfers.",
        tasks: [
            "Verify equipment lists (lenses, lapels, stabilizer)",
            "Review B-roll shotlist checklist"
        ],
        owner: "On-Ground Director",
        duration: "Day 9 of 30"
    },
    {
        day: 10,
        title: "Meta Ads Campaign Launch",
        phase: "planning",
        phaseLabel: "Planning & Strategy",
        desc: "Launch Meta lead ads campaign to capture target user registrations for the pilot and subsequent roadshow locations.",
        tasks: [
            "Activate campaign on Ads Manager",
            "Perform day-1 delivery and budget spend audit"
        ],
        owner: "Media Buyer",
        duration: "Day 10 of 30"
    },
    
    // Phase 2: Build-up (Days 11-14)
    {
        day: 11,
        title: "Venue Logistics & Coordination",
        phase: "buildup",
        phaseLabel: "Event Build-up",
        desc: "Coordinate with the IndiQube Wave site management team in Chennai on badge counters, power ports, and branding boards.",
        tasks: [
            "Confirm layout for on-site interview zone",
            "Verify WiFi and connectivity speed at the venue"
        ],
        owner: "Operations Lead",
        duration: "Day 11 of 30"
    },
    {
        day: 12,
        title: "ManyChat Live Dry Run",
        phase: "buildup",
        phaseLabel: "Event Build-up",
        desc: "Conduct stress-testing on the comment-to-DM system using simulated parent/student interactions.",
        tasks: [
            "Verify automation response times",
            "Audit lead tracking pipeline outputs"
        ],
        owner: "Automation Engineer",
        duration: "Day 12 of 30"
    },
    {
        day: 13,
        title: "Local Influencer & PR Prep",
        phase: "buildup",
        phaseLabel: "Event Build-up",
        desc: "Brief registered local influencers, education advocates, or student representatives about event attendance.",
        tasks: [
            "Send calendar invites and coordination schedules",
            "Review post templates and joint-posting formats"
        ],
        owner: "PR Coordinator",
        duration: "Day 13 of 30"
    },
    {
        day: 14,
        title: "T-1 Preparation & Final Check",
        phase: "buildup",
        phaseLabel: "Event Build-up",
        desc: "Perform a complete rehearsal. Verify on-ground schedule, speaker slots, and camera battery/audio checks.",
        tasks: [
            "Finalize the live-day content runsheet",
            "Check audio quality and equipment redundancy"
        ],
        owner: "On-Ground Director",
        duration: "Day 14 of 30"
    },
    
    // Phase 3: Live Pilot (Day 15)
    {
        day: 15,
        title: "Live Event Day: Chennai Roadshow",
        phase: "live",
        phaseLabel: "Live Pilot Event",
        desc: "EVENT DAY (June 21st, IndiQube Wave). Run real-time social stories, capture structured Vox-Pops, and backup raw files.",
        tasks: [
            "Deploy real-time social posting team (15+ updates)",
            "Conduct 10+ student/parent/counsellor video interviews",
            "Collect and organize raw B-Roll cards post-event",
            "Initialize cloud sync backup of all raw assets"
        ],
        owner: "Chennai Crew & Director",
        duration: "Day 15 of 30"
    },
    
    // Phase 4: Post-Production (Days 16-30)
    {
        day: 16,
        title: "Raw Footage Organization",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Verify all raw data cards are copied. Label audio tracks, sync multicam angles, and catalog B-Roll folders.",
        tasks: [
            "Complete 100% video/audio synchronization",
            "Label files into subfolders (Interviews, Speakers, Venue)"
        ],
        owner: "Video Editor",
        duration: "Day 16 of 30"
    },
    {
        day: 17,
        title: "Interview Selection & Transcripts",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Transcribe the best student and parent quotes from the live Chennai event to construct content storyboards.",
        tasks: [
            "Generate transcripts for top 6 interviews",
            "Identify hooks and caption angles for Reels"
        ],
        owner: "Content Strategist",
        duration: "Day 17 of 30"
    },
    {
        day: 18,
        title: "Testimonial Reels Editing (Batch 1)",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Edit first two vertical testimonial reels featuring students talking about career aspirations and Japanese culture.",
        tasks: [
            "Complete rough cuts with kinetic subtitles",
            "Apply visual branding overlays and dynamic sound design"
        ],
        owner: "Video Editor",
        duration: "Day 18 of 30"
    },
    {
        day: 19,
        title: "Testimonial Reels Review (Batch 1)",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Perform internal review of the first reel batch. Check styling, text readability, and transitions.",
        tasks: [
            "Verify brand color accuracy in captions",
            "Approve files for scheduled publishing"
        ],
        owner: "Content Director",
        duration: "Day 19 of 30"
    },
    {
        day: 20,
        title: "Master Event Film Draft (Rough Cut)",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Compile all raw event day highlights (stalls, speakers, crowd movement) into a unified high-energy event trailer.",
        tasks: [
            "Complete rough assembly of the 90s master film",
            "Incorporate speaker clips and student quotes"
        ],
        owner: "Video Editor",
        duration: "Day 20 of 30"
    },
    {
        day: 21,
        title: "Testimonial Reels Editing (Batch 2)",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Edit reels 3 and 4, shifting focus to parent safety concerns and counsellor endorsements.",
        tasks: [
            "Apply bold translations for local languages if spoken",
            "Integrate factsheet screens into counsellor testimonial reels"
        ],
        owner: "Video Editor",
        duration: "Day 21 of 30"
    },
    {
        day: 22,
        title: "Partner Recap Kits Delivery",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Deliver co-branded promotional assets and video reels to participating Japanese universities and exhibitors.",
        tasks: [
            "Upload media kits to individual partner folders",
            "Send distribution guide and suggested captions"
        ],
        owner: "Account Manager",
        duration: "Day 22 of 30"
    },
    {
        day: 23,
        title: "Master Event Film Audio & Color Grading",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Apply premium color correction (Tokyo neon / Midnight grade) and professional audio mixing for the master film.",
        tasks: [
            "Color grade footage to match brand guidelines",
            "Perform audio leveling and sound design optimization"
        ],
        owner: "Lead Editor",
        duration: "Day 23 of 30"
    },
    {
        day: 24,
        title: "Master Event Film Final Review",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Present the final cut of the Master Event Film to client coordinators for final sign-off.",
        tasks: [
            "Verify all subtitle spellings and partner names",
            "Approve final video file export"
        ],
        owner: "Client Lead",
        duration: "Day 24 of 30"
    },
    {
        day: 25,
        title: "Master Event Film Launch",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Publish the Hero Master Film across Instagram, YouTube, and LinkedIn to prime upcoming roadshows.",
        tasks: [
            "Upload master film with SEO copy and link-back baits",
            "Send WhatsApp-ready compressed file to core groups"
        ],
        owner: "Content Strategist",
        duration: "Day 25 of 30"
    },
    {
        day: 26,
        title: "Meta Ads Analytics Audit",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Review cost-per-lead and registration metrics for the Chennai run. Map audience optimization.",
        tasks: [
            "Analyze click-through rates and drop-off points",
            "Extract lead emails for subsequent mailing lists"
        ],
        owner: "Media Buyer",
        duration: "Day 26 of 30"
    },
    {
        day: 27,
        title: "Organic Boost Trigger (Kolkata Setup)",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Inject targeted ad budget to promote top-performing Chennai testimonial reels to target users in Kolkata (next roadshow leg).",
        tasks: [
            "Select top 2 reels based on organic metrics",
            "Launch local boosting campaigns in Kolkata"
        ],
        owner: "Media Buyer",
        duration: "Day 27 of 30"
    },
    {
        day: 28,
        title: "Counsellor Factsheets Distribution",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Distribute the university factsheets and follow-up kits to regional school counsellors who registered during the event.",
        tasks: [
            "Send resource bundle emails via Mailchimp",
            "Coordinate phone follow-ups for high-tier schools"
        ],
        owner: "PR Coordinator",
        duration: "Day 28 of 30"
    },
    {
        day: 29,
        title: "Final Lead Data Sync",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Synchronize all new Chennai leads (registration + ManyChat opt-ins) into the core CRM.",
        tasks: [
            "Validate lead details (phone, email, school)",
            "Assign leads to university counselors for follow-up"
        ],
        owner: "Automation Engineer",
        duration: "Day 29 of 30"
    },
    {
        day: 30,
        title: "Campaign Report & Roadmap Transfer",
        phase: "post",
        phaseLabel: "Post-Production",
        desc: "Deliver the final pilot campaign analytics report and transfer the asset library to Education Japan coordinators.",
        tasks: [
            "Compile engagement, lead count, and CTR metrics",
            "Deliver final campaign wrap-up report and assets folder link"
        ],
        owner: "Campaign Lead",
        duration: "Day 30 of 30"
    }
];

function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    campaignDays.forEach(dayData => {
        const cell = document.createElement('div');
        cell.className = `calendar-cell phase-${dayData.phase}`;
        cell.id = `cal-day-${dayData.day}`;
        cell.setAttribute('onclick', `selectCalendarDay(${dayData.day})`);
        
        // Custom indicator dot
        const indicator = document.createElement('span');
        indicator.className = 'calendar-cell-indicator';
        
        const num = document.createElement('span');
        num.className = 'calendar-cell-num';
        num.textContent = dayData.day;
        
        cell.appendChild(num);
        cell.appendChild(indicator);
        grid.appendChild(cell);
    });
    
    // Select Day 15 (Live Event Day) by default
    selectCalendarDay(15);
}

function selectCalendarDay(dayNum) {
    // Deactivate all cells
    const cells = document.querySelectorAll('.calendar-cell');
    cells.forEach(c => c.classList.remove('active'));
    
    // Activate clicked cell
    const activeCell = document.getElementById(`cal-day-${dayNum}`);
    if (activeCell) {
        activeCell.classList.add('active');
    }
    
    // Get day data
    const dayData = campaignDays.find(d => d.day === dayNum);
    if (!dayData) return;
    
    // Update Detail Panel
    const detailPanel = document.getElementById('calendar-detail-panel');
    const badge = detailPanel.querySelector('.detail-phase-badge');
    const title = detailPanel.querySelector('.detail-title');
    const desc = document.getElementById('detail-desc');
    const tasksSection = document.getElementById('detail-tasks-section');
    const tasksList = document.getElementById('detail-tasks-list');
    
    // Update badge class and text
    badge.className = `detail-phase-badge phase-${dayData.phase}`;
    badge.textContent = dayData.phaseLabel;
    
    // Update title, day num and description
    detailPanel.querySelector('.detail-day-num span').textContent = `Day ${dayNum} of 30`;
    title.textContent = dayData.title;
    desc.textContent = dayData.desc;
    
    // Render tasks
    if (dayData.tasks && dayData.tasks.length > 0) {
        tasksSection.style.display = 'block';
        tasksList.innerHTML = '';
        dayData.tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.className = 'detail-task-item';
            li.innerHTML = `
                <input type="checkbox" id="cal-task-${dayNum}-${idx}">
                <label for="cal-task-${dayNum}-${idx}">${task}</label>
            `;
            tasksList.appendChild(li);
        });
    } else {
        tasksSection.style.display = 'none';
        tasksList.innerHTML = '';
    }
    
    // Update meta details
    document.getElementById('detail-meta-duration').textContent = dayData.owner;
    document.getElementById('detail-meta-duration').previousElementSibling.textContent = "Owner / Role";
    
    document.getElementById('detail-meta-leg').textContent = dayData.duration;
    document.getElementById('detail-meta-leg').previousElementSibling.textContent = "Timeline";
}
