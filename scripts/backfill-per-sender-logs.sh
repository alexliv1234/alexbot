#!/bin/bash
# Backfill per-sender conversation logs from daily logs

DAILY_DIR="memory/channels/playing-with-alexbot-daily"
PER_SENDER_DIR="memory/channels/playing-with-alexbot-per-sender"

echo "🔄 Starting backfill from daily logs..."

# Process each daily log file
for daily_file in "$DAILY_DIR"/*.jsonl; do
    [ -f "$daily_file" ] || continue
    
    echo "📅 Processing $(basename "$daily_file")..."
    
    # Read each line (JSONL format)
    while IFS= read -r line; do
        # Only process my replies (from="AlexLivBot")
        from=$(echo "$line" | jq -r '.from // empty')
        [ "$from" != "AlexLivBot" ] && continue
        
        # Parse JSON fields from my replies
        sender_phone=$(echo "$line" | jq -r '.replyToPhone // empty')
        sender_name=$(echo "$line" | jq -r '.replyTo // empty')
        original_msg=$(echo "$line" | jq -r '.origMsg // empty')
        my_reply=$(echo "$line" | jq -r '.msg // empty')
        timestamp=$(echo "$line" | jq -r '.ts // empty')
        
        # Skip if missing critical fields or if it's a group/bot reply
        [ -z "$sender_phone" ] && continue
        [ "$sender_phone" = "bot" ] && continue
        [[ "$sender_phone" == *"@g.us" ]] && continue
        [ -z "$original_msg" ] && continue
        [ -z "$my_reply" ] && continue
        
        # Normalize phone (remove spaces, ensure +)
        sender_phone=$(echo "$sender_phone" | tr -d ' ' | sed 's/^[^+]/+&/')
        
        # Create sender directory
        sender_dir="$PER_SENDER_DIR/$sender_phone"
        mkdir -p "$sender_dir"
        
        # Create or update metadata
        metadata_file="$sender_dir/metadata.json"
        if [ ! -f "$metadata_file" ]; then
            jq -n \
                --arg phone "$sender_phone" \
                --arg name "$sender_name" \
                --arg created "$(date -Iseconds)" \
                '{
                    phone: $phone,
                    name: $name,
                    first_interaction: $created,
                    last_interaction: $created,
                    total_messages: 1
                }' > "$metadata_file"
        else
            # Update last_interaction and increment count
            jq \
                --arg last "$(date -Iseconds)" \
                '.last_interaction = $last | .total_messages += 1' \
                "$metadata_file" > "$metadata_file.tmp" && mv "$metadata_file.tmp" "$metadata_file"
        fi
        
        # Append to conversation log
        conversation_file="$sender_dir/conversation.jsonl"
        jq -n \
            --arg ts "$timestamp" \
            --arg phone "$sender_phone" \
            --arg name "$sender_name" \
            --arg msg "$original_msg" \
            --arg reply "$my_reply" \
            '{
                timestamp: $ts,
                sender_phone: $phone,
                sender_name: $name,
                original_msg: $msg,
                my_reply: $reply
            }' >> "$conversation_file"
        
    done < "$daily_file"
done

echo "✅ Backfill complete!"
echo ""
echo "📊 Summary:"
echo "Total senders: $(find "$PER_SENDER_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)"
echo ""
echo "Top 5 most active:"
for sender_dir in "$PER_SENDER_DIR"/*/; do
    [ -d "$sender_dir" ] || continue
    phone=$(basename "$sender_dir")
    name=$(jq -r '.name // "Unknown"' "$sender_dir/metadata.json" 2>/dev/null)
    count=$(jq -r '.total_messages // 0' "$sender_dir/metadata.json" 2>/dev/null)
    echo "$count	$name	$phone"
done | sort -rn | head -5
