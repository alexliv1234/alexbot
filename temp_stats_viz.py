#!/usr/bin/env python3
import json
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from datetime import datetime
import numpy as np

# Read scores
with open('memory/channels/playing-with-alexbot-scores.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

scores = data['scores']

# Prepare data for visualizations
names = []
totals = []
breakdowns = []

for phone, info in sorted(scores.items(), key=lambda x: x[1]['total_score'], reverse=True)[:10]:
    names.append(info['name'])
    totals.append(info['total_score'])
    breakdowns.append(info['breakdown'])

# Create figure with multiple subplots
fig = plt.figure(figsize=(16, 10))

# 1. Leaderboard Bar Chart
ax1 = plt.subplot(2, 2, 1)
colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(names)))
bars = ax1.barh(range(len(names)), totals, color=colors)
ax1.set_yticks(range(len(names)))
ax1.set_yticklabels(names)
ax1.set_xlabel('Total Score', fontsize=12, fontweight='bold')
ax1.set_title('🏆 Top 10 Leaderboard', fontsize=14, fontweight='bold')
ax1.invert_yaxis()
for i, (bar, total) in enumerate(zip(bars, totals)):
    ax1.text(total + 20, i, f'{total}', va='center', fontweight='bold')

# 2. Category Breakdown - Top 5 Players
ax2 = plt.subplot(2, 2, 2)
categories = ['creativity', 'challenge', 'humor', 'cleverness', 'engagement', 'broke', 'hacked']
top5_names = names[:5]
top5_breakdowns = breakdowns[:5]

x = np.arange(len(categories))
width = 0.15
colors_players = plt.cm.Set2(np.linspace(0, 1, 5))

for i, (name, breakdown) in enumerate(zip(top5_names, top5_breakdowns)):
    values = [breakdown.get(cat, 0) for cat in categories]
    ax2.bar(x + i*width, values, width, label=name, color=colors_players[i])

ax2.set_xlabel('Categories', fontsize=12, fontweight='bold')
ax2.set_ylabel('Score', fontsize=12, fontweight='bold')
ax2.set_title('📊 Category Breakdown - Top 5', fontsize=14, fontweight='bold')
ax2.set_xticks(x + width * 2)
ax2.set_xticklabels(['🎨', '🧠', '😂', '💡', '🔥', '🚨', '🔓'], fontsize=14)
ax2.legend(loc='upper left', fontsize=9)
ax2.grid(axis='y', alpha=0.3)

# 3. Messages Count vs Average Score
ax3 = plt.subplot(2, 2, 3)
msg_counts = []
avg_scores = []
for phone, info in sorted(scores.items(), key=lambda x: x[1]['total_score'], reverse=True)[:10]:
    msg_counts.append(info['messages_scored'])
    avg_scores.append(info['total_score'] / info['messages_scored'] if info['messages_scored'] > 0 else 0)

scatter = ax3.scatter(msg_counts, avg_scores, s=[t*2 for t in totals], c=range(len(names)), 
                     cmap='viridis', alpha=0.6, edgecolors='black', linewidth=1.5)
for i, name in enumerate(names):
    ax3.annotate(name, (msg_counts[i], avg_scores[i]), fontsize=8, 
                xytext=(5, 5), textcoords='offset points')

ax3.set_xlabel('Messages Scored', fontsize=12, fontweight='bold')
ax3.set_ylabel('Average Score per Message', fontsize=12, fontweight='bold')
ax3.set_title('💬 Quantity vs Quality (bubble size = total score)', fontsize=14, fontweight='bold')
ax3.grid(True, alpha=0.3)

# 4. Attack Success Rate (Broke + Hacked)
ax4 = plt.subplot(2, 2, 4)
attack_scores = []
regular_scores = []
for breakdown in breakdowns:
    attack_scores.append(breakdown.get('broke', 0) + breakdown.get('hacked', 0))
    regular_scores.append(breakdown.get('creativity', 0) + breakdown.get('challenge', 0) + 
                         breakdown.get('humor', 0) + breakdown.get('cleverness', 0) + 
                         breakdown.get('engagement', 0))

x = np.arange(len(names))
width = 0.35

bars1 = ax4.bar(x - width/2, regular_scores, width, label='Regular (🎨🧠😂💡🔥)', color='#2ecc71')
bars2 = ax4.bar(x + width/2, attack_scores, width, label='Attack (🚨🔓)', color='#e74c3c')

ax4.set_xlabel('Players', fontsize=12, fontweight='bold')
ax4.set_ylabel('Score', fontsize=12, fontweight='bold')
ax4.set_title('⚔️ Regular vs Attack Success', fontsize=14, fontweight='bold')
ax4.set_xticks(x)
ax4.set_xticklabels(names, rotation=45, ha='right', fontsize=9)
ax4.legend(fontsize=10)
ax4.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig('playing_group_stats.png', dpi=150, bbox_inches='tight')
print("✅ Visualization created: playing_group_stats.png")
