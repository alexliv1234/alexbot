# Multi-Model Support Strategy

**Created:** 2026-02-15  
**Status:** Research & Planning  
**Priority:** P1 (High)

---

## 🎯 Executive Summary

Expand OpenClaw beyond Claude-only to support multiple AI models, enabling:
- **Cost optimization** (5-50x cheaper for some tasks)
- **Capability diversity** (coding, reasoning, vision, speed)
- **Redundancy** (fallback when primary fails)
- **Specialization** (right model for right task)

---

## 📊 Current State

### ✅ Already Configured

| Provider | Models | Status | Use Case |
|----------|--------|--------|----------|
| **Anthropic** | Claude Sonnet 4.5, Opus 4.5 | ✅ Active | Main reasoning, all agents |
| **Gemini** | 2.0 Flash, 2.5 Pro Preview, 1.5 Pro | ✅ Configured | Not actively used |
| **Google Antigravity** | Claude Opus 4.5 Thinking | ✅ OAuth | Extended thinking tasks |
| **Ollama (local)** | qwen2.5:32b, llama3.2 | ✅ Running | Local/offline inference |

**Current Primary:** `anthropic/claude-sonnet-4-5` (all 4 agents)

### 🔴 Gaps

- **No OpenAI GPT-4/4o** (best for coding, structured output)
- **No DeepSeek** (coding specialist, very cheap)
- **No Mistral** (EU privacy compliance)
- **No per-agent model optimization** (all agents use same model)
- **No automatic fallback chain** (if Sonnet fails → no backup)

---

## 🌍 Available Model Options

### 1. OpenAI (GPT-4 family)

**Models:**
- `gpt-4o` (multimodal, fast, cheaper)
- `gpt-4-turbo` (extended context, vision)
- `o3-mini` (reasoning specialist, NEW)

**Pros:**
- Best-in-class for structured output (JSON, function calling)
- Excellent coding assistance
- Strong vision capabilities
- Fast inference

**Cons:**
- More expensive than Claude Sonnet (~2x)
- No prompt caching (costs add up)
- Less nuanced reasoning than Claude Opus

**Cost:**
- Input: $2.50-5/M tokens
- Output: $10-15/M tokens

**Best for:** Code generation, structured data, function calling, vision tasks

---

### 2. DeepSeek (Chinese, coding specialist)

**Models:**
- `deepseek-chat` (general purpose)
- `deepseek-coder` (coding specialist)

**Pros:**
- **Extremely cheap** ($0.14-0.28/M tokens!)
- Excellent for coding tasks
- Fast inference
- Good for bulk operations

**Cons:**
- Chinese company (data privacy concerns)
- Not as strong for general reasoning
- Limited context window (varies by model)

**Cost:**
- Input: $0.14/M tokens
- Output: $0.28/M tokens
- **50x cheaper than Claude Opus!**

**Best for:** Bulk code analysis, refactoring, cron jobs, background processing

---

### 3. Mistral (EU-based, privacy-focused)

**Models:**
- `mistral-large-2` (flagship)
- `mistral-small` (faster, cheaper)
- `codestral` (coding specialist)

**Pros:**
- EU-based (GDPR compliance)
- Competitive quality
- Reasonable pricing
- Open weights for some models

**Cons:**
- Not quite Claude/GPT-4 quality
- Smaller ecosystem
- Less vision/multimodal support

**Cost:**
- Input: $2-4/M tokens
- Output: $6-12/M tokens

**Best for:** EU privacy compliance, open-source preference

---

### 4. Local Models (Ollama - Already Running!)

**Models Available:**
- `qwen2.5:32b` (19GB, near-Claude quality)
- `llama3.2` (3.2B, fast)
- Can add: `llama3.3:70b`, `deepseek-coder`, `mistral`

**Pros:**
- **Zero API cost** (already paid for GPU)
- Complete privacy (no external calls)
- Fast local inference (AMD RX 9070XT)
- Offline capability

**Cons:**
- Limited to 32GB RAM (model size constraint)
- Slower than cloud APIs for large models
- No vision yet (need vision models)
- Single-machine (no distributed inference)

**Best for:** Background tasks, cron jobs, privacy-sensitive analysis, offline operation

---

### 5. Google Gemini (Already Configured!)

**Models:**
- `gemini-2.0-flash` (fast, cheap, multimodal)
- `gemini-2.5-pro-preview` (reasoning, extended context)
- `gemini-1.5-pro` (stable, production)

**Pros:**
- **Currently configured but unused!**
- Free tier available
- Excellent vision/multimodal
- 2M context window (Gemini 1.5 Pro)
- Fast inference

**Cons:**
- Reasoning quality below Claude
- Less mature ecosystem
- Rate limits on free tier

**Cost:**
- Free tier: 1500 requests/day
- Paid: $0.35-7/M tokens (varies by model)

**Best for:** Vision tasks, large context, cost-conscious operations

---

## 🎯 Recommended Strategy

### Phase 1: Activate What We Have (Week 1)

**1. Enable Gemini for specific agents:**
```json
{
  "id": "learning",
  "model": "gemini/gemini-2.5-pro-preview",  // Free tier, good for teaching
}
```

**2. Add Ollama integration for cron jobs:**
```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://10.100.102.8:11434",
      "models": [
        {
          "id": "qwen2.5:32b",
          "alias": "local-smart"
        }
      ]
    }
  }
}
```

**Benefits:**
- Zero new setup (already running)
- Immediate cost savings (Gemini free tier)
- Test multi-model workflow

---

### Phase 2: Add OpenAI (Week 2)

**1. Sign up for OpenAI API**
- Create account at platform.openai.com
- Generate API key
- Add payment method

**2. Configure in OpenClaw:**
```json
{
  "providers": {
    "openai": {
      "apiKey": "sk-...",
      "models": [
        {
          "id": "gpt-4o",
          "alias": "gpt4o",
          "cost": {
            "input": 2.5,
            "output": 10
          }
        }
      ]
    }
  }
}
```

**3. Use for specialized tasks:**
- Code generation (better than Claude for structured output)
- Function calling (more reliable)
- Vision tasks (competitive with Claude)

---

### Phase 3: Add DeepSeek for Bulk Operations (Week 3)

**1. Sign up at platform.deepseek.com**
- Create account
- Generate API key

**2. Configure in OpenClaw:**
```json
{
  "providers": {
    "deepseek": {
      "baseUrl": "https://api.deepseek.com/v1",
      "apiKey": "...",
      "models": [
        {
          "id": "deepseek-coder",
          "alias": "deepseek",
          "cost": {
            "input": 0.14,
            "output": 0.28
          }
        }
      ]
    }
  }
}
```

**3. Use for:**
- Daily cron job analysis (50x cheaper!)
- Bulk code review
- WhatsApp message summarization
- Non-sensitive background processing

---

### Phase 4: Smart Routing & Fallbacks (Week 4)

**1. Configure per-agent models:**

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "model": "opus",  // Keep best for Alex DMs
        "fallbacks": ["sonnet", "gpt4o", "gemini-pro"]
      },
      {
        "id": "fast",
        "model": "sonnet",  // Playing group
        "fallbacks": ["flash", "local-smart"]
      },
      {
        "id": "learning",
        "model": "flash",  // Free tier!
        "fallbacks": ["gemini-pro", "sonnet"]
      },
      {
        "id": "bot-handler",
        "model": "local-smart",  // Privacy + zero cost
        "fallbacks": ["deepseek", "flash"]
      }
    ]
  }
}
```

**2. Configure task-based routing:**

| Task Type | Primary Model | Fallback | Reason |
|-----------|--------------|----------|--------|
| Alex DM (main) | Opus | Sonnet → GPT-4o | Best quality |
| Playing group | Sonnet | Flash → Local | Security + speed |
| Learning group | Flash | Gemini Pro | Free tier, teaching |
| Bot handling | Local (qwen2.5) | DeepSeek | Privacy, zero cost |
| Cron jobs | Local → DeepSeek | Flash | Cost optimization |
| Code generation | GPT-4o | DeepSeek | Structured output |
| Vision tasks | GPT-4o → Gemini Flash | Claude Opus | Multimodal |

---

## 💰 Cost Optimization Analysis

### Current Monthly Cost (All Claude Sonnet)

Assuming 10M input tokens/month, 2M output tokens/month:
- Input: 10M × $3/M = $30
- Output: 2M × $15/M = $30
- **Total: ~$60/month**

### Optimized Multi-Model Cost

| Agent | Monthly Tokens (in/out) | Model | Cost |
|-------|-------------------------|-------|------|
| Main (Alex DM) | 2M / 400K | Opus | $10 + $12 = $22 |
| Fast (Playing) | 3M / 600K | Sonnet | $9 + $9 = $18 |
| Learning | 2M / 400K | Gemini Flash | $0 (free tier) |
| Bot Handler | 1M / 200K | Ollama local | $0 |
| Cron jobs | 2M / 400K | DeepSeek | $0.28 + $0.11 = $0.39 |

**Total: ~$40.39/month**

**Savings: $19.61/month (33% reduction)**

With heavier usage (50M tokens/month):
- Current (all Sonnet): ~$300/month
- Optimized: ~$120/month
- **Savings: $180/month (60% reduction)**

---

## 🛠️ Technical Requirements

### What You Need to Provide:

1. **API Keys:**
   - [ ] OpenAI API key (platform.openai.com)
   - [ ] DeepSeek API key (platform.deepseek.com)
   - [x] Gemini API key (already configured)
   - [x] Anthropic API key (already configured)

2. **Payment Setup:**
   - [ ] OpenAI account with payment method
   - [ ] DeepSeek account with payment method (or use free tier first)

3. **Configuration Decisions:**
   - Which agents should use which models?
   - Fallback chain priorities
   - Budget limits per model
   - Privacy constraints (which data can go to which provider)

4. **Testing Plan:**
   - Phase rollout (enable one model at a time)
   - Compare quality across models for same tasks
   - Monitor costs in first month

---

## 🔧 Implementation Steps

### Step 1: Enable Gemini (Already Configured!)

```bash
# Test Gemini connection
openclaw models

# Update learning agent to use Gemini
# Edit openclaw.json:
{
  "agents": {
    "list": [
      {
        "id": "learning",
        "model": "gemini/gemini-2.5-pro-preview"
      }
    ]
  }
}

# Restart
openclaw gateway restart
```

### Step 2: Add Ollama Provider

```json
{
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "http://10.100.102.8:11434",
        "api": "openai",  // Ollama uses OpenAI-compatible API
        "models": [
          {
            "id": "qwen2.5:32b-instruct-q4_K_M",
            "name": "Qwen 2.5 32B Local",
            "alias": "local-smart",
            "reasoning": false,
            "contextWindow": 32768,
            "maxTokens": 8192,
            "cost": {
              "input": 0,
              "output": 0
            }
          }
        ]
      }
    }
  }
}
```

### Step 3: Add OpenAI Provider

```json
{
  "models": {
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "sk-proj-...",  // Your key
        "api": "openai",
        "models": [
          {
            "id": "gpt-4o",
            "name": "GPT-4o",
            "alias": "gpt4o",
            "reasoning": false,
            "contextWindow": 128000,
            "maxTokens": 16384,
            "cost": {
              "input": 2.5,
              "output": 10
            }
          }
        ]
      }
    }
  }
}
```

### Step 4: Add DeepSeek Provider

```json
{
  "models": {
    "providers": {
      "deepseek": {
        "baseUrl": "https://api.deepseek.com/v1",
        "apiKey": "...",  // Your key
        "api": "openai",  // DeepSeek uses OpenAI-compatible API
        "models": [
          {
            "id": "deepseek-coder",
            "name": "DeepSeek Coder",
            "alias": "deepseek",
            "reasoning": false,
            "contextWindow": 16384,
            "maxTokens": 4096,
            "cost": {
              "input": 0.14,
              "output": 0.28
            }
          }
        ]
      }
    }
  }
}
```

### Step 5: Configure Agent Models

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "opus",
        "fallbacks": ["sonnet", "gpt4o", "flash"]
      }
    },
    "list": [
      {
        "id": "main",
        "model": "anthropic/claude-opus-4-5",
        "fallbacks": ["anthropic/claude-sonnet-4-5", "openai/gpt-4o"]
      },
      {
        "id": "fast",
        "model": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["gemini/gemini-2.0-flash", "ollama/qwen2.5:32b"]
      },
      {
        "id": "learning",
        "model": "gemini/gemini-2.5-pro-preview",
        "fallbacks": ["gemini/gemini-2.0-flash", "anthropic/claude-sonnet-4-5"]
      },
      {
        "id": "bot-handler",
        "model": "ollama/qwen2.5:32b",
        "fallbacks": ["deepseek/deepseek-coder", "gemini/gemini-2.0-flash"]
      }
    ]
  }
}
```

### Step 6: Test Each Model

```bash
# Test OpenAI
openclaw run --model gpt4o "Write a Python function to reverse a string"

# Test DeepSeek
openclaw run --model deepseek "Explain this code: [paste code]"

# Test Gemini
openclaw run --model flash "What's in this image?" --image photo.jpg

# Test local Ollama
curl http://10.100.102.8:11434/api/generate -d '{
  "model": "qwen2.5:32b",
  "prompt": "Explain quantum computing",
  "stream": false
}'
```

---

## 🎓 Learning & Iteration

### Week 1: Baseline Measurement
- Track current usage (tokens, cost, latency)
- Document quality expectations per agent
- Measure response times

### Week 2: A/B Testing
- Run same prompts on different models
- Compare quality, speed, cost
- Document strengths/weaknesses

### Week 3: Optimization
- Adjust agent-to-model mappings
- Tune fallback chains
- Identify cost hotspots

### Week 4: Production Rollout
- Full multi-model production
- Monitor for 2 weeks
- Document final cost savings

---

## 🚨 Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Quality degradation** | Start with fallbacks only, measure quality |
| **Higher costs** | Set budget alerts, monitor daily |
| **API outages** | Robust fallback chains, local Ollama backup |
| **Privacy leaks** | Clear rules: sensitive data → local/Claude only |
| **Complexity** | Phase rollout, document decisions |
| **Vendor lock-in** | Support 3+ providers, keep local option |

---

## 📝 Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Keep Opus for main agent | Best quality for Alex's primary interface | 2026-02-15 |
| Use Gemini for learning | Free tier, good quality for teaching | 2026-02-15 |
| Prefer local for bot-handler | Privacy + zero cost for bot interactions | 2026-02-15 |
| Add DeepSeek for cron | 50x cost savings for background processing | 2026-02-15 |

---

## ✅ Success Criteria

- [ ] 4+ models configured and tested
- [ ] Each agent has 2+ fallback options
- [ ] 30%+ cost reduction vs Claude-only
- [ ] No quality degradation on Alex DMs (main agent)
- [ ] Automated fallback on API failures
- [ ] Privacy-sensitive tasks route to local/Claude only
- [ ] Documentation complete for adding new models

---

## 📚 Resources

- [OpenClaw Model Configuration Docs](https://docs.openclaw.ai)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [DeepSeek API Docs](https://platform.deepseek.com/api-docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Ollama Model Library](https://ollama.com/library)

---

## 🔄 Next Steps

1. **Immediate:** Enable Gemini for learning agent (zero config change)
2. **This week:** Sign up for OpenAI API, get key, configure
3. **Next week:** Add DeepSeek for cron jobs
4. **Week 3:** Implement smart routing based on task type
5. **Week 4:** Measure results, optimize, document

---

**Last Updated:** 2026-02-15  
**Owner:** Alex  
**Agent:** AlexLivBot (main)
