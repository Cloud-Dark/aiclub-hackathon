// Teks tambahan untuk area "auth" (id/en/zh). Digabung ke kamus utama di index.js.
export default {
  id: { busy: { wait: "MOHON TUNGGU…" }, login: {
    prompt: "masuk/portal", title: "MASUK KE PORTAL", titleRegister: "DAFTAR AKUN PORTAL",
    body: "Ini akun portal hackathon, terpisah dari akun lain. Setelah masuk, lengkapi data diri, lalu pasar tim terbuka.",
    badge: "AKUN PORTAL HACKATHON", tabLogin: "MASUK", tabRegister: "DAFTAR", tabsLabel: "Masuk atau daftar",
    nama: "NAMA LENGKAP", namaPh: "nama kamu", email: "EMAIL", emailPh: "nama@email.com", pass: "KATA SANDI", passPh: "min. 8 karakter",
    passHint: "8 sampai 128 karakter.", submit: "MASUK", submitRegister: "DAFTAR", busy: "MEMPROSES...",
    errNama: "Isi nama dulu", errEmail: "Format email belum benar", errPass: "Isi kata sandi dulu", errPassLen: "Kata sandi 8 sampai 128 karakter",
    captcha: "Verifikasi keamanan", errCaptcha: "Selesaikan verifikasi keamanan dulu", errCaptchaFailed: "Verifikasi keamanan gagal. Coba lagi.",
    errGeneric: "Gagal terhubung ke server. Coba lagi."
  } },
  en: { busy: { wait: "PLEASE WAIT…" }, login: {
    prompt: "login/portal", title: "SIGN IN TO THE PORTAL", titleRegister: "CREATE A PORTAL ACCOUNT",
    body: "This is a hackathon portal account, separate from any other account. After signing in, complete your profile, then the team market opens.",
    badge: "HACKATHON PORTAL ACCOUNT", tabLogin: "SIGN IN", tabRegister: "REGISTER", tabsLabel: "Sign in or register",
    nama: "FULL NAME", namaPh: "your name", email: "EMAIL", emailPh: "name@email.com", pass: "PASSWORD", passPh: "min. 8 characters",
    passHint: "8 to 128 characters.", submit: "SIGN IN", submitRegister: "REGISTER", busy: "WORKING...",
    errNama: "Enter your name first", errEmail: "That email doesn't look right", errPass: "Enter a password first", errPassLen: "Password must be 8 to 128 characters",
    captcha: "Security check", errCaptcha: "Complete the security check first", errCaptchaFailed: "Security check failed. Try again.",
    errGeneric: "Could not reach the server. Try again."
  } },
  zh: { busy: { wait: "请稍候…" }, login: {
    prompt: "登录/portal", title: "登录黑客松门户", titleRegister: "注册门户账号",
    body: "这是黑客松门户账号，与其他账号相互独立。登录后请补全个人资料，之后即可进入组队市场。",
    badge: "黑客松门户账号", tabLogin: "登录", tabRegister: "注册", tabsLabel: "登录或注册",
    nama: "姓名", namaPh: "你的姓名", email: "邮箱", emailPh: "name@email.com", pass: "密码", passPh: "至少 8 个字符",
    passHint: "8 至 128 个字符。", submit: "登录", submitRegister: "注册", busy: "处理中...",
    errNama: "请先填写姓名", errEmail: "邮箱格式不正确", errPass: "请先输入密码", errPassLen: "密码需为 8 至 128 个字符",
    captcha: "安全验证", errCaptcha: "请先完成安全验证", errCaptchaFailed: "安全验证失败，请重试。",
    errGeneric: "无法连接服务器，请重试。"
  } }
};
