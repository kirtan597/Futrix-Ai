const API = "https://futrix-node-api.onrender.com";
const email = `fresh_${Date.now()}@test.com`;
const resume = "Full Stack Developer with 5+ years. JavaScript TypeScript React Node MongoDB Docker AWS GraphQL REST APIs microservices. Led platform development mentored team architected infrastructure.";

async function test() {
    try {
        console.log(`\n[1] Login: ${email}`);
        const login = await fetch(`${API}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        }).then(r => r.json());
        
        const token = login.accessToken;
        console.log("✅ Success\n");
        
        console.log("[2] Upload Resume");
        const upload = await fetch(`${API}/api/upload-resume`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: resume, email })
        }).then(r => r.json());
        
        if (upload.readiness_score !== undefined) {
            console.log("✅ Success");
            console.log(`Score: ${upload.readiness_score}%`);
            console.log(`Skills: ${upload.skills?.length}`);
            console.log(`Gaps: ${upload.gap_skills?.length}`);
            console.log("\n🎉 UPLOAD WORKING CORRECTLY!");
        } else {
            console.log("❌ Failed");
            console.log(upload);
        }
    } catch(e) {
        console.log("Error:", e.message);
    }
}

test();
