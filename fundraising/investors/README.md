# Investors Directory

This directory contains detailed profiles, research, and communication logs for each potential investor.

---

## 📁 Structure

Each investor gets their own directory:

```
investors/
├── {investor-id}/
│   ├── profile.json          # Basic info + current stage
│   ├── research.md           # Deep research on investor/fund
│   ├── strategy.md           # Outreach strategy + messages
│   ├── communications.jsonl  # Full communication log
│   └── notes.md             # Internal notes
└── README.md                 # This file
```

---

## 🆔 Investor ID Format

`{firstname-lastname}` (lowercase, hyphens)

Examples:
- `alon-lifshitz`
- `eden-shochat`
- `josh-wolfe`

---

## 🔄 Workflow

### Adding New Investor
```bash
bash ../scripts/add-investor.sh "+972XXXXXXXXX" "Full Name" "Fund Name"
```

### Research Phase
```bash
bash ../scripts/research-investor.sh investor-id
```

### Generate Strategy
```bash
bash ../scripts/generate-strategy.sh investor-id
```

### Send Intro (After Approval)
```bash
bash ../scripts/send-intro.sh investor-id
```

### Log Communication
```bash
bash ../scripts/log-communication.sh investor-id "direction" "message"
```

---

## 📊 Stages

1. **research** - Gathering information
2. **strategy** - Planning approach
3. **ready** - Approved, ready to send
4. **outreach** - Intro sent, awaiting response
5. **responded** - They replied
6. **meeting** - Meeting scheduled/completed
7. **materials** - Sent deck/docs
8. **due_diligence** - Active DD process
9. **term_sheet** - Negotiating terms
10. **closed** - Deal signed! 🎉
11. **passed** - Not interested
12. **nurture** - Not now, maybe later

---

## 🎯 Priority Levels

- **critical** - Lead investor potential, time-sensitive
- **high** - Strong fit, priority outreach
- **medium** - Good fit, standard flow
- **low** - Nice to have, passive approach

---

**Last Updated:** 2026-02-26
