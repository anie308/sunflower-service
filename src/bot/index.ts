import { Telegraf, Markup } from "telegraf";
const token = process.env.TELEGRAM_BOT_TOKEN;
const serverUrl = process.env.SERVER_URL;

const bot = new Telegraf(token);
import axios from "axios";

const getProfilePicture = async (userId: any) => {
  try {
    const photos = await bot.telegram.getUserProfilePhotos(userId);
    if (photos.total_count > 0) {
      const fileId = photos.photos[0][0].file_id;
      const file = await bot.telegram.getFile(fileId);
      const profilePictureUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      console.log("Profile Picture URL:", profilePictureUrl); // Add this line
      return profilePictureUrl;
    }
    return null;
  } catch (error) {
    console.error("Error getting profile photo:", error);
    return null;
  }
};

// Start command
bot.start(async (ctx) => {
  const referralCode = ctx.payload;
  const username = ctx.from.username;
  const profilePicture = await getProfilePicture(ctx.from.id);
  const imageUrl =
    "https://res.cloudinary.com/wallnet/image/upload/v1726351913/bannerflow_pnnugl.png";
  try {
    const res = await axios.post(`${serverUrl}/api/user/register`, {
      username,
      referralCode,
      profilePicture,
    });

    if (res.status === 200 || res.status === 201) {
      ctx.replyWithPhoto(
        { url: imageUrl },
        {
          caption: `Welcome to Sunflower Brawl Bot 🌻, @${ctx.from.username}!`,
          reply_markup: {
            inline_keyboard: [
              [Markup.button.url("Join community", `https://t.me/sunflower_coin`)],
              [Markup.button.url("Sunflower on X", "https://www.x.com/Sunflower_Coin")],
      
              //  [
              //   Markup.button.webApp(
              //     "🔥Test Brawl now!",
              //     `https://ef3a-102-90-47-135.ngrok-free.app`
              //   ),
              // ],
              [
                Markup.button.webApp(
                  "Brawl now!",
                  `https://sunflower-flame.vercel.app/`
                ),
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.log("Error registering user:", error);
    // ctx.reply("Internal server error");
  }

  console.log("started");
});

// Handle button clicks
bot.action("start_now", (ctx) => ctx.reply('You clicked "Start now!"'));
bot.action("join_community", (ctx) =>
  ctx.reply('You clicked "Join community"')
);
bot.action("help", (ctx) => ctx.reply('You clicked "Help"'));

// Launch the bot

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export default bot;
