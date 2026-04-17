import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const changeLanguage = (): void => {
    const order = ["en", "es", "pt"] as const;
    const current = i18n.language.split("-")[0];

    const currentIndex = order.indexOf(current as typeof order[number]);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;

    i18n.changeLanguage(order[nextIndex]);
};

i18n.use(I18nextBrowserLanguageDetector).use(initReactI18next).init({
    debug: true,
    lng: "pt",
    resources: {
        en: {
            translation: {
                //identify which page it is
                //Home
                slogan_1: "Think together,",
                slogan_2: "in real time.",
                description_1: "A shared canvas for your team - draw, plan,",
                description_2: "and collaborate without the noise.",
                sign_up: "Get started",
                log_in: "Log in",

                //userSignup
                create_account: "Create your workspace account",
                username: "Username",
                your_name: "Your name",
                your_email: "you@example.com",
                password: "Password",
                your_password: "at least 6 characters",
                next: "Next",
                choose_avatar: "Choose your avatar",
                how_others_see_you: "This is how other will see you.",
                default_avatars: "Default avatars",
                upload_your_own: "Upload your own",
                choose_image: "Choose image",
                image_loaded: "Imaged loaded",
                creating_account: "Creating account...",
                create_accout_confirm: "Create account →",
                back: "← Back",
                already_have_account: "Already have an account?",
            
                //userLogin
                sign_in_workspace: "Sign in to your workspace",
                signing_in: "Signing in...",
                sign_in_confirm: "Sign in →",
                open_auth_app: "Open your authenticator app and enter the 6-digit code.",
                auth_code: "Authentication Code",
                verifying: "Verifying...",
                verify: "Verify →",
                back_to_login: "← Back to login",
                dont_have_acc: "Don't have an account?",
                create_one: "Create one",
            },
        },
        pt: {
            translation: {
                //Home
                slogan_1: "Pense junto,",//bad translation
                slogan_2: "em tempo real.",
                description_1: "Um canvas partilhado pela tua equipa:",//bad translation: canvas
                description_2: "desenha, planeia e colabora sem incomodo.",//bad translation: incomodo
                sign_up: "Comecar",//bad translation: c de cedilha (criar conta, create account in en)
                log_in: "Iniciar sessao",//bad translation: sessao

                //userSignup
                create_account: "Criar conta de workspace",//bad translation: workspace
                username: "Nome de utilizador",
                your_name: "o teu utilizador",//bad translation: utilizador
                your_email: "oteunome@exemplo.com",
                password: "palavra-passe",
                your_password: "pelo menos 6 caracteres",//bad translation: caracteres
                next: "Seguinte",
                choose_avatar: "Escolher avatar",//bad translation: avatar
                how_others_see_you: "Isto eh como outros te vao ver",//bad translation: eh, vao
                default_avatars: "Avatars pre-definidos",//bad translation: avatars
                upload_your_own: "Upload your own",//bad translation: BAD
                choose_image: "Escolher imagem",
                image_loaded: "Imagem carregada",
                creating_account: "A criar conta...",
                create_accout_confirm: "Criar conta →",
                back: "← Atras",//bad translation: atras
                already_have_account: "Ja tens conta?",//bad translation: ja
            
                //userLogin
                sign_in_workspace: "Sign in to your workspace",
                signing_in: "Signing in...",
                sign_in_confirm: "Sign in →",
                open_auth_app: "Open your authenticator app and enter the 6-digit code.",
                auth_code: "Authentication Code",
                verifying: "Verifying...",
                verify: "Verify →",
                back_to_login: "← Back to login",
                dont_have_acc: "Don't have an account?",
                create_one: "Create one",
            },
        },
        es: {
            translation: {
                //Home
                slogan_1: "<es_slogan_1>,",
                slogan_2: "<es_slogan_2>.",
                description_1: "<es_description_1>,",
                description_2: "<es_description_2>.",
                sign_up: "<es_sign_up>",
                log_in: "<es_log_in>",

                //userSignup
                create_account: "<es_create_account>",
                username: "<es_username>",
                your_name: "<es_your_name>",
                your_email: "<es_your_email>",
                password: "<es_your_email>",
                your_password: "<es_your_password>",
                next: "<es_next>",
                choose_avatar: "<es_choose_avatar>",
                how_others_see_you: "<es_how_others_see_you>",
                default_avatars: "<es_default_avatars>",
                upload_your_own: "<es_upload_your_own>",
                choose_image: "<es_choose_image>",
                image_loaded: "<es_image_loaded>",
                creating_account: "<es_creating_account>",
                create_accout_confirm: "<es_create_accout_confirm> →",
                back: "← <es_back>",
                already_have_account: "<es_already_have_account>",
            
                
                //userLogin
                sign_in_workspace: "Sign in to your workspace",
                signing_in: "Signing in...",
                sign_in_confirm: "Sign in →",
                open_auth_app: "Open your authenticator app and enter the 6-digit code.",
                auth_code: "Authentication Code",
                verifying: "Verifying...",
                verify: "Verify →",
                back_to_login: "← Back to login",
                dont_have_acc: "Don't have an account?",
                create_one: "Create one",
            },
        },
    }
})