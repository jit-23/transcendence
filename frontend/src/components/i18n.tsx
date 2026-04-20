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

                //dashboard
                profile: "Profile",
                add_friend: "Add friend",
                friend_req: "Friend Requests",
                no_pend_req: "No pending requests.",
                refresh_req: "Refresh",
                accept_req: "Accept",
                reject_req: "Reject",
                sign_out: "Sign out",
                welcome_back: "Welcome back, ",
                manage_acc_sec: "Manage your account and security settings.",
                talk_to_friends: "Talk to friends",
                open_dashboard: "Open",
                plan_projects: "Plan Your Projects",

                //TwoFactorCard
                two_fac_auth: "Two-Factor Authentication",
                protect_acc_2fa: "Protect your account with a time-based one-time password from an authenticator app.",
                enabled_2fa: "Enabled",
                disabled_2fa: "Disabled",
                loading_2fa: "Loading...",
                enable_2fa: "Enable 2FA",
                scan_2fa: "Scan this with Google Authenticator or Authy.",
                wont_see_2fa: "You won't see it again.",
                enter_2fa: "Enter the 6-digit code from your app to confirm:",
                confirm_2fa: "Confirm",
                acc_protected_2fa: "Your account is protected. An authenticator code is required at every login.",
                disable_2fa: "Disable 2FA",
                enter_curr_2fa: "Enter your current authenticator code to confirm:",
                disabling_2fa: "Disabling...",
                cancel_2fa: "Cancel",

                //FriendsCard
                my_friends: "My Friends",
                loading_friends: "Loading...",
                refresh_friends: "Refresh",
                no_friends: "You do not have friends yet.",
                chat_friends: "Chat",
                removing_friends: "Removing...",
                unfriend: "Unfriend",

                //Canvases
                plan_group_proj: "Plan Your Group Projects",
                create_canvas_proj: "Create canvases for project planning and collaboration.",
                your_canvases: "Your Canvases ",
                loading_canvases: "Loading...",
                max_3_canvases: "Max 3 Canvases",
                add_canvas: "Add Canvas",
                canvas_name_opt: "Canvas name (optional)",
                creating_canvas: "Creating...",
                create_canvas: "Create",
                cancel_canvas: "Cancel",
                delete_canvas: "Delete",
                no_canvas: "No canvases yet. Create one to get started!",
                chat_rooms: "Chat Rooms",
                use_canvas: "Use canvases to sketch, plan, and organize group work.",//seems like this text is wrong
                chat_room: "chat rooms",

                //Profile
                dashboard_prof: "← Dashboard",
                edit_profile: "Edit Profile",
                update_prof: "Update your account information and avatar.",
                account_details: "Account Details",
                username_prof: "Username",
                new_pass_prof: "New Password",
                leave_blank_prof: "Leave blank to keep current",
                confirm_new_pass_prof: "Confirm New Password",
                repeat_new_prof: "Repeat new password",
                curr_pass_prof: "Current Password",
                req_save_prof: "Required to save any changes",
                saving_change_prof: "Saving...",
                save_change_prof: "Save Changes",
                cancel_prof: "Cancel",
                
                //Avatar
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
                sign_in_workspace: "Inicia sessao no teu workspace",//bad: sessao, workspace
                signing_in: "A iniciar sessao...",//bad: sessao
                sign_in_confirm: "Iniciar sessao →",//bad: sessao
                open_auth_app: "Abre a tua app the autenticacao e insere o codigo de 6 digitos.",//aut, codigo, digitos
                auth_code: "Codigo de autenticacao",//bad: codigo, aut
                verifying: "A verificar...",//bad, another word for verify
                verify: "Verificar →",//bad, another word for verify
                back_to_login: "← De volta ao login",//bad: login, also different from last
                dont_have_acc: "Nao tens conta?",//bad: nao, also different from last
                create_one: "Cria uma",//bad: also different from last
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
                sign_in_workspace: "<es_sign_in_workspace>",
                signing_in: "<es_signing_in>...",
                sign_in_confirm: "<es_sign_in_confirm> →",
                open_auth_app: "<es_open_auth_app>.",
                auth_code: "<es_auth_code>",
                verifying: "<es_verifying>...",
                verify: "<es_verify> →",
                back_to_login: "← <es_back_to_login>",
                dont_have_acc: "<es_dont_have_acc>?",
                create_one: "<es_create_one>",
            },
        },
    }
})