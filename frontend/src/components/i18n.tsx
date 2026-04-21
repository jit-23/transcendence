import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import React from "react";

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
                //utils
                //utils: cancel, delete, refresh, loading, dashboard
                cancel_button: "Cancel",
                delete_button: "Delete",
                refresh_button: "Refresh",
                loading_button: "Loading...",
                dashboard_button: "Dashboard",

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
                refresh_req: "Refresh REPLACE",
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
                refresh_friends: "Refresh REPLACE",
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

                //Canvas
                apply_canvas: "Apply",
                canvas_canvas: "Canvas",//might not use
                clear_canvas: "Clear",
                background_canvas: "Background",
                line_color_canvas: "Line Color",
                tool_canvas: "Tool",
                cursor_canvas: "Cursor",
                freehand_canvas: "Free Hand",
                eraser_canvas: "Eraser",
                line_canvas: "Line",
                arrow_canvas: "Arrow",
                rect_canvas: "Rectangle",
                rounded_rect_canvas: "Rounded Rectangle",
                circle_canvas: "Circles",
                text_canvas: "Text",
                textbox_canvas: "Text Box",
                rounded_textbox_canvas: "Rounded Text Box",
                fill_shape_canvas: "Fill Shape",
                text_font_canvas: "Text Font",
                stroke_weight_canvas: "Stroke Weight",

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
                save_avatar: "Save Avatar",
                cancel_prof: "Cancel",
                preview_avatar: "Preview",
                others_see_avatar: "This is how others will see you",

                //App
                page_doesnt_exist: "This page doesn't exist.",
                go_home: "Go home",

                //chat
                direct_chat: "Direct Chat",
                open_chat: "Open",
                talking_to_chat: "Talking to:",
                select_username_chat: "Select a username to start chatting",
                no_messages_chat: "No messages yet",
                friend_username_chat: "Friend username",
                type_message_chat: "Type a message",
                send_chat: "Send",
                is_typing_chat: "is typing...",

                //conversations
                dashboard_convo: "Dashboard",
                choose_convo: "Choose Conversation Type",
                pick_how_convo: "Pick how you want to chat.",
                one_to_one_convo: "1 to 1 Conversation",
                group_chat_convo: "Group Chats",

                //groupChats
                group_chats_gcs: "Group Chats",
                create_groups_gcs: "Create groups and chat with multiple friends.",
                create_group_gcs: "Create Group",
                you_need_friends_gcs: "You need friends to create a group",
                creating_gcs: "Creating...",
                create_button_gcs: "Create Group",
                refresh_gcs: "Refresh REPLACE",
                no_groups_gcs: "No groups yet.",
                members_gcs: "members",
                open_chat_gcs: "Open Chat",
                
                //searchFriends
                dashboard_friends: "Dashboard",//Useless
                profile_friends: "Profile",//Useless
                search_friends: "Search for Friends",
                find_friends: "Find users by username or email",
                search_user: "Search by username or email...",
                searching_friends: "Searching...",
                search_button: "Search",
                no_results_friends: "No results found",
                no_user_match_friends: "No users match your search",
                results_friends: "Results",
                requested_friends: "✓ Requested",
                add_friends: "+ Add"
            },
        },
        pt: {
            translation: {
                //utils
                cancel_button: "Cancelar",
                delete_button: "Eliminar",
                refresh_button: "Atualizar",
                loading_button: "A carregar...",
                dashboard_button: "Painel de controlo",

                //Home
                slogan_1: "Pensa em conjunto,",
                slogan_2: "em tempo real.",
                description_1: "Um canvas partilhado pela tua equipa:",//bad: canvas
                description_2: "desenha, planeia e colabora sem incómodo.",
                sign_up: "Começar",//(criar conta, create account in en)
                log_in: "Iniciar sessão",

                //userSignup
                create_account: "Criar conta de workspace",//bad: workspace
                username: "Nome de utilizador",
                your_name: "o teu utilizador",
                your_email: "oteunome@exemplo.com",
                password: "palavra-passe",
                your_password: "pelo menos 6 caractéres",//bad: caracteres
                next: "Seguinte",
                choose_avatar: "Escolher foto de perfil",
                how_others_see_you: "Isto é como outros te vão ver",
                default_avatars: "Fotos de perfil pré-definidas",
                upload_your_own: "Carrega uma imagem tua",//bad translation: BAD
                choose_image: "Escolher imagem",
                image_loaded: "Imagem carregada",
                image_loaded_avatar: "✓ Imagem carregada — Carrega guardar",
                creating_account: "A criar conta...",
                create_accout_confirm: "Criar conta →",
                back: "← Atrás",
                already_have_account: "Já tens conta?",
            
                //userLogin
                sign_in_workspace: "Inicia sessão no teu workspace",//bad: workspace
                signing_in: "A iniciar sessão...",
                sign_in_confirm: "Iniciar sessão →",
                open_auth_app: "Abre a tua aplicação de autenticação e insere o cõdigo de 6 dígitos.",
                auth_code: "Código de autenticação",
                verifying: "A verificar...",
                verify: "Verificar →",
                back_to_login: "← De volta ao inicio de sessão",//inicio
                dont_have_acc: "Não tens conta?",
                create_one: "Cria uma",

                //dashboard
                profile: "Perfil",
                add_friend: "Adicionar amigo",
                friend_req: "Pedidos de amizade",
                no_pend_req: "Nenhum pedido de amizade.",
                refresh_req: "Atualizar",
                accept_req: "Aceitar",
                reject_req: "Rejeitar",
                sign_out: "Terminar sessão",
                welcome_back: "Bem vind(o/a) de volta, ",//(o/a)
                manage_acc_sec:  "Opções de conta e de seguranca",
                talk_to_friends: "Falar com amigos",
                open_dashboard: "Abrir",
                plan_projects: "Planeia os teus projetos",

                //TwoFactorCard
                two_fac_auth: "Autenticação de dois fatores",
                protect_acc_2fa: "Protege a tua conta com um código de utilização única a partir de uma aplicação de autenticação",
                enabled_2fa: "Ligada",
                disabled_2fa: "Desligada",
                loading_2fa: "A carregar...",
                enable_2fa: "Ativar 2FA",//bad 2FA
                scan_2fa: "Lê o código com Google Authenticator ou Authy", 
                wont_see_2fa: "Não irás ver este código de novo",
                enter_2fa: "Escreve o código de 6 dígitos da tua aplicação para confirmar", 
                confirm_2fa: "Confirmar",
                acc_protected_2fa: "A tua conta esta protegida. Um código de autenticação e necessário para todas as sessões", 
                disable_2fa: "Desativar 2FA",
                enter_curr_2fa: "Escreve o código de autenticação atual",
                disabling_2fa: "A desativar...",
                cancel_2fa: "Cancelar",//existing: cancel

                //FriendsCard
                my_friends: "Amigos",//bad
                loading_friends: "A carregar...",//existing
                refresh_friends: "Atualizar",//existing
                no_friends: "Ainda não tens amigos.",
                chat_friends: "Conversas",
                removing_friends: "A remover...",
                unfriend: "Remover amigo",

                //Canvases
                plan_group_proj: "Planeia os teus projetos",//existing
                create_canvas_proj: "Cria canvas para planeamento de projeto e colaboração",//bad: canvas
                your_canvases: "Os teus canvas",//bad: canvas
                loading_canvases: "A carregar...",//existing
                max_3_canvases: "Máximo: 3 canvas",//bad: canvas
                add_canvas: "Adicionar canvas",//bad: canvas
                canvas_name_opt: "Nome do canvas (opcional)",//bad: canvas
                creating_canvas: "A criar...",
                create_canvas: "Criar",
                cancel_canvas: "Cancelar",//existing: cancel
                delete_canvas: "Eliminar",//existing: delete
                no_canvas: "Não tens canvas. Cria um para começar!",//comecar, nao
                chat_rooms: "Salas de conversa",
                use_canvas: "Usa o canvas para desenhar, planear e organizar trabalho de grupo",//seems like this text is wrong 
                chat_room: "Salas de conversa",

                //Canvas
                apply_canvas: "Aplicar",
                canvas_canvas: "Canvas",//might not use
                clear_canvas: "Eliminar",//existing: delete
                background_canvas: "Background",//FALTA
                line_color_canvas: "Cor de linha",//cor mal escrito?
                tool_canvas: "Ferramenta",
                cursor_canvas: "Cursor",//bad?
                freehand_canvas: "Mão livre",//bad
                eraser_canvas: "Borracha",
                line_canvas: "Linha",
                arrow_canvas: "Seta",
                rect_canvas: "Retângulo",
                rounded_rect_canvas: "Retângulo arredondado",
                circle_canvas: "Circulo",
                text_canvas: "Texto",
                textbox_canvas: "Caixa de texto",
                rounded_textbox_canvas: "Caixa de texto arredondada",
                fill_shape_canvas: "Preencher forma",//bad
                text_font_canvas: "Fonte de texto",//bad
                stroke_weight_canvas: "Peso de escrita",//bad

                //Profile
                dashboard_prof: "← Dashboard",//bad, existing
                edit_profile: "Editar perfil",
                update_prof: "Atualizar a informação da conta e foto de perfil.",
                account_details: "Detalhes da conta",
                username_prof: "Nome de utilizador",
                new_pass_prof: "Nova palavra-passe",
                leave_blank_prof: "Deixa em branco para manter a mesma",
                confirm_new_pass_prof: "Confirmar palavra-passe novaZ",
                repeat_new_prof: "Repete a nova palavra-passe",
                curr_pass_prof: "Palavra-passe atual",
                req_save_prof: "Necessário para aplicar mudanças",
                saving_change_prof: "A guardar...",
                save_change_prof: "Guardar alterações",
                save_avatar: "Guardar foto de perfil",
                cancel_prof: "Cancelar",//existing: cancel
                preview_avatar: "Pre-visualizar",
                others_see_avatar: "Isto é como os outros vão ver-te",

                //App
                page_doesnt_exist: "Esta página não existe.",
                go_home: "Ir para a página principal",

                //chat
                direct_chat: "Conversas privadas",
                open_chat: "Abrir",//existing i think
                talking_to_chat: "A falar com:",
                select_username_chat: "Seleciona um utilizador para conversar",
                no_messages_chat: "Sem mensagens",
                friend_username_chat: "Nome de amigo",//bad
                type_message_chat: "Escreve uma mensagem",
                send_chat: "Enviar",
                is_typing_chat: "está a escrever...",

                //conversations
                dashboard_convo: "Dashboard",//bad, existing
                choose_convo: "Escolher tipo de conversa",
                pick_how_convo: "Escolhe como queres conversar.",
                one_to_one_convo: "Conversa 1 para 1",
                group_chat_convo: "Conversa de grupo",

                //groupChats
                group_chats_gcs: "Conversas de grupo",
                create_groups_gcs: "Cria grupos e conversa com múltiplos amigos",
                create_group_gcs: "Cria um grupo",
                you_need_friends_gcs: "Precisas de amigos para criar um grupo",
                creating_gcs: "A criar...",
                create_button_gcs: "Criar grupo",
                refresh_gcs: "Atualizar",//existing
                no_groups_gcs: "Sem grupos.",
                members_gcs: "membros",
                open_chat_gcs: "Abrir conversa",
                
                //searchFriends
                dashboard_friends: "Dashboard",//bad, existing
                profile_friends: "Perfil",
                search_friends: "Pesquisar por amigos",
                find_friends: "Pesquisar utilizadores por nome ou email",
                search_user: "Procurar por nome ou email...",
                searching_friends: "A procurar...",
                search_button: "Procurar",
                no_results_friends: "Nenhum resultado",
                no_user_match_friends: "Nenhum utilizador coincide com a pesquisa",//acento no coincide?
                results_friends: "Resultados",
                requested_friends: "✓ Pedido",
                add_friends: "+ Adicionar"
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



type LanguageSwitcherProps = {
  onClick: () => void;
  top?: number;
  right?: number;
};


const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    onClick,
    top = 20,
    right = 70,
}) => {
  return (
    <button
      className="theme-toggle"
      onClick={onClick}
      title="Change language"
      style={{ position: "fixed", top, right }}
    >
      
    {i18n.language === "pt" ? "🇵🇹" : "🇬🇧"}
    </button>
  );
};

export default LanguageSwitcher;