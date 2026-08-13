import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

const JOB_LISTING_SCHEMA = {
  type: 'object',
  properties: {
    jobs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'İş unvanı, Türkçe' },
          company_name: { type: 'string', description: 'Gerçekçi şirket adı' },
          salary_per_tick: { type: 'integer', description: 'Vardiya başına TL maaş, 800-45000 arası, kıdemle orantılı' },
          exp_per_tick: { type: 'integer', description: '10-150 arası' },
          required_education: { type: 'string', enum: ['HIGH_SCHOOL', 'BACHELOR', 'MASTER'] },
          required_reputation: { type: 'integer', description: '0-900 arası' },
          min_health_req: { type: 'integer', description: '0-40 arası' },
          min_happiness_req: { type: 'integer', description: '0-40 arası' },
        },
        required: [
          'title', 'company_name', 'salary_per_tick', 'exp_per_tick',
          'required_education', 'required_reputation', 'min_health_req', 'min_happiness_req',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['jobs'],
  additionalProperties: false,
};

const ADVICE_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['CASH_FLOW', 'INVESTMENT', 'HEALTH', 'CAREER'] },
          title: { type: 'string', description: 'Kısa, Türkçe başlık' },
          advice: { type: 'string', description: 'Oyuncunun gerçek verilerine dayanan, 1-3 cümlelik somut tavsiye, Türkçe' },
        },
        required: ['category', 'title', 'advice'],
        additionalProperties: false,
      },
    },
  },
  required: ['recommendations'],
  additionalProperties: false,
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { jobs: null, expiresAt: 0 };

app.get('/api/v1/career/opportunities', async (req, res) => {
  try {
    if (cache.jobs && Date.now() < cache.expiresAt) {
      return res.json({ jobs: cache.jobs });
    }

    if (!anthropic) {
      return res.status(503).json({
        error: 'ANTHROPIC_API_KEY yapılandırılmadı. server/.env dosyasına gerçek bir anahtar ekleyin.',
        jobs: [],
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      output_config: { format: { type: 'json_schema', schema: JOB_LISTING_SCHEMA } },
      messages: [{
        role: 'user',
        content:
          'Generate 9 varied, realistic job listings in Turkish for a life-simulation mobile game set in Istanbul. ' +
          'Cover entry-level to executive roles across different industries (tech, finance, hospitality, retail, ' +
          'healthcare, creative). Use plausible Turkish/international-sounding company names. Scale salary_per_tick ' +
          'and required_education with seniority.',
      }],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('AI içerik üretimi reddedildi.');
    }

    const textBlock = response.content.find((block) => block.type === 'text');
    const parsed = JSON.parse(textBlock.text);

    const jobs = parsed.jobs.map((job) => ({
      id: 'job-' + crypto.randomUUID(),
      ...job,
    }));

    cache = { jobs, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json({ jobs });
  } catch (err) {
    console.error('AI career listing generation failed:', err);
    res.status(502).json({ error: 'İş ilanları AI tarafından üretilemedi.', jobs: [] });
  }
});

app.post('/api/v1/ai/financial-advice', async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(503).json({
        error: 'ANTHROPIC_API_KEY yapılandırılmadı. server/.env dosyasına gerçek bir anahtar ekleyin.',
        recommendations: [],
      });
    }

    const p = req.body || {};
    const snapshot = {
      cash_balance: p.cash_balance ?? 0,
      bank_balance: p.bank_balance ?? 0,
      total_liquid: p.total_liquid ?? 0,
      credit_score: p.credit_score ?? 1000,
      reputation: p.reputation ?? 0,
      education_level: p.education_level ?? 'BACHELOR',
      health: p.health ?? 100,
      happiness: p.happiness ?? 100,
      energy: p.energy ?? 100,
      vehicle_count: p.vehicle_count ?? 0,
      unrented_vehicle_count: p.unrented_vehicle_count ?? 0,
      property_count: p.property_count ?? 0,
      vacant_property_count: p.vacant_property_count ?? 0,
      active_debts_owed: p.active_debts_owed ?? 0,
    };

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2048,
      output_config: { format: { type: 'json_schema', schema: ADVICE_SCHEMA } },
      messages: [{
        role: 'user',
        content:
          'You are an in-game financial & life advisor for a Turkish life-simulation mobile game. ' +
          'Given this player\'s real current state (JSON below), give up to 4 short, concrete, actionable ' +
          'recommendations in Turkish, each tagged with the most fitting category (CASH_FLOW, INVESTMENT, HEALTH, or CAREER). ' +
          'Base every recommendation strictly on the numbers given — do not invent unrelated facts, and only include a ' +
          'category if the data actually supports a recommendation there (e.g. skip HEALTH if health/happiness/energy are all high). ' +
          'Player state:\n' + JSON.stringify(snapshot, null, 2),
      }],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('AI danışmanlık üretimi reddedildi.');
    }

    const textBlock = response.content.find((block) => block.type === 'text');
    const parsed = JSON.parse(textBlock.text);

    res.json({ recommendations: parsed.recommendations });
  } catch (err) {
    console.error('AI financial advice generation failed:', err);
    res.status(502).json({ error: 'AI danışmanlık tavsiyesi üretilemedi.', recommendations: [] });
  }
});

app.listen(PORT, () => {
  console.log(`AI career backend listening on http://localhost:${PORT}`);
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY not set — /career/opportunities will return 503 until server/.env is configured.');
  }
});
