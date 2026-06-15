import TrackBase from "trackbase";

const main = async () => {
  try {
    const tb = new TrackBase({
      apiKey: "trk_live_mockapikey123",
      baseUrl: "http://localhost:8080"
    });

    console.log("Testing identifying user...");
    await tb.identify({ name: "Alice", email: "alice@example.com" });
    console.log("Identify passed.");
  } catch (e: any) {
    console.error("Identify failed gracefully:", e.message);
  }

  try {
    const tb = new TrackBase({
      apiKey: "trk_live_mockapikey123",
      baseUrl: "http://localhost:8080"
    });

    console.log("Testing user count...");
    const count = await tb.userCount();
    console.log("User count passed:", count);
  } catch (e: any) {
    console.error("User count failed gracefully:", e.message);
  }

  try {
    const tb = new TrackBase({
      apiKey: "trk_live_mockapikey123",
      baseUrl: "http://localhost:8080"
    });

    console.log("Testing analytics...");
    const analytics = await tb.analytics();
    console.log("Analytics passed:", analytics);
  } catch (e: any) {
    console.error("Analytics failed gracefully:", e.message);
  }
};

main();
