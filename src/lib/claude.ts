import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

interface PetProfile {
  name: string;
  species: string;
  breed?: string | null;
  traits?: string | null;
  habits?: string | null;
  bio?: string | null;
}

interface ActivityResult {
  activity: string;
  scene: string;
  generated_at: string;
}

export async function generateActivity(
  pet: PetProfile
): Promise<ActivityResult> {
  const timeOfDay = getTimeOfDay();
  const seed = Math.floor(Math.random() * 10000);

  const prompt = `You are describing what a beloved pet is doing right now in their peaceful afterlife world called Pawdise — a beautiful, magical place where pets live happily forever.

Pet profile:
- Name: ${pet.name}
- Species: ${pet.species}${pet.breed ? ` (${pet.breed})` : ""}
${pet.traits ? `- Personality: ${pet.traits}` : ""}
${pet.habits ? `- Favorite things & habits: ${pet.habits}` : ""}
${pet.bio ? `- Their story: ${pet.bio}` : ""}

Current time in Pawdise: ${timeOfDay}
Seed (for variety): ${seed}

Write a short, warm observation of what ${pet.name} is doing right now.

Rules:
- 1-2 sentences max
- Use present tense ("is", "has found", "discovered")
- Reference their personality or habits if possible
- The tone is peaceful, gentle, and heartwarming — not sad
- No dialogue or speech from the pet
- End with a scene name (2-4 words, e.g. "cosmic meadow", "sunny hilltop", "golden garden")

Respond with JSON only:
{
  "activity": "<what the pet is doing right now>",
  "scene": "<2-4 word scene name>"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned unexpected format");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    activity: parsed.activity,
    scene: parsed.scene,
    generated_at: new Date().toISOString(),
  };
}
