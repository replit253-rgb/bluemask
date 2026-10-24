import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required for seeding FAQs.");
  process.exit(1);
}

const faqs = [
  {
    id: "seed-faq-supported-games",
    question: "Which games does RedMoon support?",
    answer:
      "RedMoon lists Whiteout Survival, Kingshot, Rise of Kingdoms, and Call of Dragons. Available services can vary by game.",
  },
  {
    id: "seed-faq-buy-sell-accounts",
    question: "How can I buy or sell a game account?",
    answer:
      "Contact the RedMoon team on Discord with the game and account details. The team can discuss current offers and the next steps with you.",
  },
  {
    id: "seed-faq-middleman",
    question: "How does the middleman service work?",
    answer:
      "Both parties contact the team with the deal details. The team reviews the agreement, coordinates the handover, and releases the funds after the buyer confirms receipt.",
  },
  {
    id: "seed-faq-topup-games",
    question: "Which games can I top up?",
    answer:
      "Top-up packs are listed for Whiteout Survival and Kingshot. Check the relevant game page for the packs currently available.",
  },
  {
    id: "seed-faq-topup-request",
    question: "How do I request a top-up?",
    answer:
      "Choose an available pack, then send its details and your Player ID in a Discord ticket. Follow the payment instructions provided by the team.",
  },
];

async function seedFaqs() {
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    await client.query("BEGIN");

    for (const faq of faqs) {
      await client.query(
        `INSERT INTO faqs (id, question, answer)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET
          question = EXCLUDED.question,
          answer = EXCLUDED.answer`,
        [faq.id, faq.question, faq.answer],
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded ${faqs.length} FAQs.`);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back FAQ seeding:", rollbackError);
    }
    console.error("Failed to seed FAQs:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void seedFaqs();
