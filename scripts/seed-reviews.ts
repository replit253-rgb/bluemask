import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required for seeding reviews.");
  process.exit(1);
}

const reviews = [
  {
    id: "seed-review-middleman-whiteout-survival-daffa",
    service: "middleman",
    game: "whiteout-survival",
    name: "Daffa",
    role: "Buyer",
    quote:
      "My first time buying an account and I was still paranoid. With the middleman, the funds were held until the Whiteout account was fully transferred and I could log in safely. Only then was the seller paid.",
    date: "Oct 2026",
  },
  {
    id: "seed-review-middleman-kingshot-sella",
    service: "middleman",
    game: "kingshot",
    name: "Sella",
    role: "Seller",
    quote:
      "I was selling a Kingshot account and worried about getting scammed. A ticket was opened, both sides agreed, and the middleman held the funds. The money was released that same night after the buyer confirmed.",
    date: "Sep 2026",
  },
  {
    id: "seed-review-middleman-rise-of-kingdoms-bagas",
    service: "middleman",
    game: "rise-of-kingdoms",
    name: "Bagas",
    role: "Buyer",
    quote:
      "The team checked the ROK account before the deal: city hall, commanders, power, everything matched what the seller promised. Zero drama.",
    date: "Oct 2026",
  },
  {
    id: "seed-review-middleman-call-of-dragons-nadia",
    service: "middleman",
    game: "call-of-dragons",
    name: "Nadia",
    role: "Seller",
    quote:
      "The Call of Dragons handover was guided step by step. The buyer was also told to check everything before paying. Both of us felt at ease.",
    date: "Aug 2026",
  },
  {
    id: "seed-review-middleman-all-yoga",
    service: "middleman",
    game: "all",
    name: "Yoga",
    role: "Buyer",
    quote:
      "The Discord is responsive and every step is explained as it happens. Even a big deal felt as easy as buying phone credit.",
    date: "Sep 2026",
  },
  {
    id: "seed-review-middleman-all-kevin",
    service: "middleman",
    game: "all",
    name: "Kevin",
    role: "Seller",
    quote:
      "The middleman fee is clear upfront, no hidden charges. Proof of transfer is posted right in the ticket, no chasing anyone.",
    date: "Oct 2026",
  },
  {
    id: "seed-review-accounts-whiteout-survival-fajar",
    service: "jual-beli-akun",
    game: "whiteout-survival",
    name: "Fajar",
    role: "Buyer",
    quote:
      "I asked for a Whiteout account within my budget, and two days later I got several options with screenshots. The one I picked was even better than I expected.",
    date: "Oct 2026",
  },
  {
    id: "seed-review-accounts-kingshot-mira",
    service: "jual-beli-akun",
    game: "kingshot",
    name: "Mira",
    role: "Seller",
    quote:
      "My Kingshot account sold within a week. They showed me how to document the account so buyers would notice it fast.",
    date: "Sep 2026",
  },
  {
    id: "seed-review-accounts-rise-of-kingdoms-arif",
    service: "jual-beli-akun",
    game: "rise-of-kingdoms",
    name: "Arif",
    role: "Buyer",
    quote:
      "The ROK listings are honest — power and VIP level match the description. They even helped with negotiating until we had a deal.",
    date: "Aug 2026",
  },
  {
    id: "seed-review-accounts-call-of-dragons-lulu",
    service: "jual-beli-akun",
    game: "call-of-dragons",
    name: "Lulu",
    role: "Seller",
    quote:
      "Nobody was interested for a while, but the team kept promoting my Call of Dragons account. Eventually a serious buyer showed up.",
    date: "Sep 2026",
  },
  {
    id: "seed-review-accounts-all-gilang",
    service: "jual-beli-akun",
    game: "all",
    name: "Gilang",
    role: "Buyer",
    quote:
      "Prices are open to discussion, and every payment goes through a safe channel. I was never asked to transfer to a personal bank account.",
    date: "Oct 2026",
  },
  {
    id: "seed-review-accounts-all-tasya",
    service: "jual-beli-akun",
    game: "all",
    name: "Tasya",
    role: "Seller",
    quote:
      "Guided from listing to sale. If you're unsure about selling your account, talk to the team first.",
    date: "Jul 2026",
  },
] as const;

async function seedReviews() {
  const client = new pg.Client({ connectionString });
  let transactionStarted = false;

  try {
    await client.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    for (const review of reviews) {
      await client.query(
        `INSERT INTO testimonials (id, service, game, name, role, quote, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
          service = EXCLUDED.service,
          game = EXCLUDED.game,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          quote = EXCLUDED.quote,
          date = EXCLUDED.date`,
        [
          review.id,
          review.service,
          review.game,
          review.name,
          review.role,
          review.quote,
          review.date,
        ],
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;
    console.log(`Seeded ${reviews.length} source-provided reviews.`);
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back review seeding:", rollbackError);
      }
    }
    console.error("Failed to seed reviews:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void seedReviews();
