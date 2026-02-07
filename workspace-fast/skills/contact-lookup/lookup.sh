#!/bin/bash
# Contact lookup script - searches all contact sources
# Supports Hebrew/English cross-matching and common name variations
# Usage: lookup.sh "name"

NAME="$1"

if [ -z "$NAME" ]; then
    echo "Usage: $0 <name>"
    exit 1
fi

# Build search variations (Hebrew ↔ English common names)
declare -A NAME_MAP=(
    ["רון"]="ron|ronny|ronald|רון|רוני"
    ["ron"]="ron|ronny|ronald|רון|רוני"
    ["אלכס"]="alex|alexander|אלכס|אלכסנדר"
    ["alex"]="alex|alexander|אלכס|אלכסנדר"
    ["דוד"]="david|dave|דוד|דודי"
    ["david"]="david|dave|דוד|דודי"
    ["משה"]="moshe|moses|מושה|משה"
    ["יוסי"]="yossi|yosi|joseph|יוסי|יוסף"
    ["דני"]="danny|daniel|dan|דני|דניאל"
    ["מיכאל"]="michael|mike|miki|מיכאל|מיקי"
    ["שרון"]="sharon|שרון"
    ["נועה"]="noa|noah|נועה"
    ["שיר"]="shir|שיר"
    ["גיא"]="guy|גיא"
    ["עומר"]="omer|omar|עומר"
    ["ירון"]="yaron|jaron|ירון"
    ["דורון"]="doron|דורון"
    ["אורי"]="uri|ori|אורי"
)

# Get variations or use original name
NAME_LOWER=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')
VARIATIONS="${NAME_MAP[$NAME_LOWER]:-$NAME}"

echo "=== Searching for: $NAME ==="
echo "=== Variations: $VARIATIONS ==="
echo ""

# Function to search with regex
search_pattern="($VARIATIONS)"

# Search esh employees
echo "--- esh Employees ---"
jq -r --arg pattern "$search_pattern" '.[] | 
    select(
        ((.name // "") | test($pattern; "i")) or
        ((.firstName // "") | test($pattern; "i")) or
        ((.lastName // "") | test($pattern; "i"))
    ) | "• \(.name // ((.firstName // "") + " " + (.lastName // ""))): \(.phone // .mobile // "no phone")"' memory/esh_employees.json 2>/dev/null | head -15

echo ""

# Search Google contacts  
echo "--- Google Contacts ---"
jq -r --arg pattern "$search_pattern" '.[] | 
    select(
        ((.name // "") | test($pattern; "i")) or
        ((.displayName // "") | test($pattern; "i"))
    ) | "• \(.name // .displayName): \(.phone // .phones[0] // "no phone")"' memory/whatsapp/google_contacts.json 2>/dev/null | head -15

echo ""

# Search WhatsApp directory
echo "--- WhatsApp Known ---"
jq -r --arg pattern "$search_pattern" 'to_entries[] | 
    select(
        ((.value.name // "") | test($pattern; "i")) or
        ((.value.pushName // "") | test($pattern; "i"))
    ) | "• \(.value.name // .value.pushName): \(.key)"' memory/whatsapp/directory.json 2>/dev/null | head -15

echo ""
echo "=== Done ==="
