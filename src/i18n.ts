import { getLocales } from 'expo-localization';

export type Locale = 'en' | 'es';
type Plural = { one: string; other: string };
type Params = Record<string, string | number>;

// English is the source of truth. `es` must have the same keys and the same
// shape (string or plural pair) or the typecheck fails.
const en = {
  appName: 'Gift-Wrapped',
  home: 'Home',
  cancel: 'Cancel',
  settings: 'Settings',

  // sign-in
  signInEyebrow: 'for the list makers',
  welcomeBack: 'Welcome back',
  makeAccount: 'Make your account',
  signInSub: 'Build wishlists and invite guests with a code. Their claims stay a surprise.',
  email: 'Email',
  password: 'Password',
  createAccount: 'Create account',
  signIn: 'Sign in',
  forgotPassword: 'Forgot password?',
  haveAccount: 'I already have an account',
  newHere: 'New here? Create an account',
  invitedTitle: 'Invited to a list?',
  invitedSub: 'No account needed. Join with the code you were sent.',
  joinWithCode: 'Join with a code',
  myJoinedLists: 'My joined lists',
  enterEmailFirst: 'Enter your email above, then tap Forgot password.',
  resetSent: 'If an account exists for that email, a password reset link is on its way.',
  resetFailed: 'Could not send the reset email. Try again.',

  // join
  joinEyebrow: "you're invited",
  joinTitle: 'Join a list',
  joinSub: 'No account needed. The list owner never sees who claims what.',
  inviteCode: 'Invite code',
  yourName: 'Your name',
  enterCodeAndName: 'Enter the code and your name.',
  join: 'Join',
  joining: 'Joining...',
  noListForCode: 'No list matches that code.',

  // joined lists
  joinedEyebrow: "lists you've joined",
  joinedTitle: 'Joined lists',
  joinedEmpty: 'Lists you join show up here.',
  joinedAs: 'Joined as {name}',
  listGone: 'This list is no longer available.',
  signedOutGuest: 'This device is no longer signed in as that guest. Join again with the invite code.',
  openListFailed: 'Could not open the list. Check your connection and try again.',
  leave: 'Leave',
  remove: 'Remove',

  // my lists
  listsEyebrow: 'your wishlists',
  myLists: 'My lists',
  noDate: 'No date',
  startList: 'Start a new list',
  listTitlePlaceholder: "Title, like Maya's birthday",
  createList: 'Create list',
  signOut: 'Sign out',
  giveTitle: 'Give the list a title.',
  createListFailed: 'Could not create the list. Try again.',

  // dates
  dateOptional: 'Date, optional',
  clear: 'Clear',
  daysToGo: '{count} days to go',
  tomorrow: 'Tomorrow',
  today: 'Today',
  datePassed: 'Date has passed',
  forDate: 'for {date}',
  yourWishlist: 'your wishlist',
  statToday: 'Today',
  statIsTheDay: 'is the day',
  statDaysToGo: { one: 'day to go', other: 'days to go' } as Plural,

  // owner list
  guestCount: { one: '{count} guest', other: '{count} guests' } as Plural,
  statGuests: { one: 'guest', other: 'guests' } as Plural,
  statCode: 'invite code',
  invite: 'Invite',
  shareMessage: 'Join my Gift-Wrapped list "{title}". Code: {code}\n{url}',
  claimsWrapped: "Your guests' claims stay wrapped up. No peeking.",
  noWishes: 'No wishes yet',
  noWishesSub: "Add a name and a link. We'll find a picture from the shop's page.",
  addWishButton: 'Add a wish',
  editList: 'Edit list',
  titlePlaceholder: 'Title',
  saveList: 'Save list',
  deleteList: 'Delete list',
  deleteListTitle: 'Delete list?',
  deleteListBody: '"{title}" and all its items will be deleted. Guests lose access. This cannot be undone.',
  openItem: 'Open {name}',
  editItem: 'Edit {name}',
  openDomain: 'Open {domain}',

  // wish editor
  wishEyebrowEdit: 'a little change',
  wishEyebrowNew: 'something lovely',
  editWish: 'Edit wish',
  addWish: 'Add a wish',
  wishSub: "Paste a link from any shop. We'll look for a picture on the first one.",
  wishNamePlaceholder: 'What is it?',
  linksPlaceholder: 'Links, one per line',
  needNameAndLink: 'Add a name and at least one link.',
  findingPicture: 'Finding a picture...',
  saving: 'Saving...',
  saveWish: 'Save wish',
  deleteWish: 'Delete wish',
  deleteWishTitle: 'Delete wish?',
  deleteWishBody: '"{name}" will be removed for you and your guests.',
  delete: 'Delete',

  // guest list
  guestTitle: 'Pick something lovely',
  youAre: "You're {name}",
  ownerCantSee: "the owner can't see what's claimed",
  guestEmpty: 'Nothing on this list yet. Check back soon.',
  gettingMine: "You're getting this",
  gettingOther: "{name}'s getting this",
  claim: "I'll get it",
  undo: 'Undo',

  // settings
  signedInAs: 'signed in as',
  deleteAccount: 'Delete account',
  deleteAccountSub: 'Enter your password to confirm. This deletes every list you own, then your account.',
  enterPasswordConfirm: 'Enter your password to confirm.',
  deleteAccountTitle: 'Delete account?',
  deleteAccountBody: 'All your lists and items are deleted and your account is removed. Guests lose access. This cannot be undone.',
  deleting: 'Deleting...',
  wrongPassword: 'Wrong password. Nothing was deleted.',
  confirmPasswordFailed: 'Could not confirm your password. Nothing was deleted.',
  listsNotDeleted: 'Some lists could not be deleted. Your account still exists. Try again.',
  accountNotRemoved: 'Your lists were deleted, but your account could not be removed. Try again to finish.',

  // errors
  errInvalidCredential: 'That email and password do not match. Check them and try again.',
  errEmailInUse: 'An account with that email already exists. Try signing in instead.',
  errWeakPassword: 'Choose a stronger password with at least 6 characters.',
  errInvalidEmail: 'Enter a valid email address.',
  errNetwork: 'No connection. Check your internet and try again.',
  errTooManyRequests: 'Too many attempts. Wait a moment and try again.',
  errRequiresRecentLogin: 'For your security, sign in again and then retry.',
  errGeneric: 'Something went wrong. Try again.',
};

export type Key = keyof typeof en;
type Shape = { [K in Key]: (typeof en)[K] extends string ? string : Plural };

const es: Shape = {
  appName: 'Gift-Wrapped',
  home: 'Inicio',
  cancel: 'Cancelar',
  settings: 'Ajustes',

  signInEyebrow: 'para quienes arman listas',
  welcomeBack: 'Qué bueno verte otra vez',
  makeAccount: 'Crea tu cuenta',
  signInSub: 'Arma listas de deseos e invita con un código. Lo que reserven seguirá siendo una sorpresa.',
  email: 'Correo electrónico',
  password: 'Contraseña',
  createAccount: 'Crear cuenta',
  signIn: 'Iniciar sesión',
  forgotPassword: '¿Olvidaste tu contraseña?',
  haveAccount: 'Ya tengo una cuenta',
  newHere: '¿Eres nuevo? Crea una cuenta',
  invitedTitle: '¿Te invitaron a una lista?',
  invitedSub: 'No necesitas cuenta. Únete con el código que te enviaron.',
  joinWithCode: 'Unirme con un código',
  myJoinedLists: 'Mis listas unidas',
  enterEmailFirst: 'Escribe tu correo arriba y toca «¿Olvidaste tu contraseña?».',
  resetSent: 'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.',
  resetFailed: 'No pudimos enviar el correo de restablecimiento. Inténtalo de nuevo.',

  joinEyebrow: 'te invitaron',
  joinTitle: 'Únete a una lista',
  joinSub: 'No necesitas cuenta. Quien creó la lista nunca ve quién reserva qué.',
  inviteCode: 'Código de invitación',
  yourName: 'Tu nombre',
  enterCodeAndName: 'Escribe el código y tu nombre.',
  join: 'Unirme',
  joining: 'Uniéndote...',
  noListForCode: 'No encontramos ninguna lista con ese código.',

  joinedEyebrow: 'listas a las que te uniste',
  joinedTitle: 'Listas unidas',
  joinedEmpty: 'Las listas a las que te unas aparecerán aquí.',
  joinedAs: 'Te uniste como {name}',
  listGone: 'Esta lista ya no está disponible.',
  signedOutGuest: 'Este dispositivo ya no tiene tu sesión de invitado. Vuelve a unirte con el código de invitación.',
  openListFailed: 'No pudimos abrir la lista. Revisa tu conexión e inténtalo de nuevo.',
  leave: 'Salir',
  remove: 'Quitar',

  listsEyebrow: 'tus listas de deseos',
  myLists: 'Mis listas',
  noDate: 'Sin fecha',
  startList: 'Crea una lista nueva',
  listTitlePlaceholder: 'Título, como el cumpleaños de Maya',
  createList: 'Crear lista',
  signOut: 'Cerrar sesión',
  giveTitle: 'Ponle un título a la lista.',
  createListFailed: 'No pudimos crear la lista. Inténtalo de nuevo.',

  dateOptional: 'Fecha (opcional)',
  clear: 'Borrar',
  daysToGo: 'Faltan {count} días',
  tomorrow: 'Mañana',
  today: 'Hoy',
  datePassed: 'La fecha ya pasó',
  forDate: 'para el {date}',
  yourWishlist: 'tu lista de deseos',
  statToday: 'Hoy',
  statIsTheDay: 'es el gran día',
  statDaysToGo: { one: 'día restante', other: 'días restantes' },

  guestCount: { one: '{count} invitado', other: '{count} invitados' },
  statGuests: { one: 'invitado', other: 'invitados' },
  statCode: 'código',
  invite: 'Invitar',
  shareMessage: 'Únete a mi lista de Gift-Wrapped "{title}". Código: {code}\n{url}',
  claimsWrapped: 'Lo que reserven tus invitados queda envuelto. Sin espiar.',
  noWishes: 'Aún no hay deseos',
  noWishesSub: 'Agrega un nombre y un enlace. Buscaremos una imagen en la página de la tienda.',
  addWishButton: 'Agregar un deseo',
  editList: 'Editar lista',
  titlePlaceholder: 'Título',
  saveList: 'Guardar lista',
  deleteList: 'Eliminar lista',
  deleteListTitle: '¿Eliminar la lista?',
  deleteListBody: 'Se eliminarán "{title}" y todos sus artículos. Los invitados perderán el acceso. Esta acción no se puede deshacer.',
  openItem: 'Abrir {name}',
  editItem: 'Editar {name}',
  openDomain: 'Abrir {domain}',

  wishEyebrowEdit: 'un pequeño cambio',
  wishEyebrowNew: 'algo bonito',
  editWish: 'Editar deseo',
  addWish: 'Agrega un deseo',
  wishSub: 'Pega un enlace de cualquier tienda. Buscaremos una imagen en el primero.',
  wishNamePlaceholder: '¿Qué es?',
  linksPlaceholder: 'Enlaces, uno por línea',
  needNameAndLink: 'Agrega un nombre y al menos un enlace.',
  findingPicture: 'Buscando una imagen...',
  saving: 'Guardando...',
  saveWish: 'Guardar deseo',
  deleteWish: 'Eliminar deseo',
  deleteWishTitle: '¿Eliminar el deseo?',
  deleteWishBody: '"{name}" se quitará para ti y para tus invitados.',
  delete: 'Eliminar',

  guestTitle: 'Elige algo especial',
  youAre: 'Eres {name}',
  ownerCantSee: 'quien creó la lista no ve lo reservado',
  guestEmpty: 'Esta lista aún está vacía. Vuelve pronto.',
  gettingMine: 'Tú lo regalas',
  gettingOther: '{name} lo regala',
  claim: 'Voy a regalarlo',
  undo: 'Deshacer',

  signedInAs: 'sesión iniciada como',
  deleteAccount: 'Eliminar cuenta',
  deleteAccountSub: 'Escribe tu contraseña para confirmar. Se eliminarán todas tus listas y después tu cuenta.',
  enterPasswordConfirm: 'Escribe tu contraseña para confirmar.',
  deleteAccountTitle: '¿Eliminar la cuenta?',
  deleteAccountBody:
    'Se eliminarán todas tus listas y artículos, y tu cuenta se cerrará. Los invitados perderán el acceso. Esta acción no se puede deshacer.',
  deleting: 'Eliminando...',
  wrongPassword: 'Contraseña incorrecta. No se eliminó nada.',
  confirmPasswordFailed: 'No pudimos confirmar tu contraseña. No se eliminó nada.',
  listsNotDeleted: 'No se pudieron eliminar algunas listas. Tu cuenta sigue activa. Inténtalo de nuevo.',
  accountNotRemoved: 'Tus listas se eliminaron, pero no pudimos cerrar tu cuenta. Inténtalo de nuevo para terminar.',

  errInvalidCredential: 'El correo y la contraseña no coinciden. Revísalos e inténtalo de nuevo.',
  errEmailInUse: 'Ya existe una cuenta con ese correo. Prueba iniciando sesión.',
  errWeakPassword: 'Elige una contraseña más segura, de al menos 6 caracteres.',
  errInvalidEmail: 'Escribe un correo electrónico válido.',
  errNetwork: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
  errTooManyRequests: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  errRequiresRecentLogin: 'Por tu seguridad, vuelve a iniciar sesión y reinténtalo.',
  errGeneric: 'Algo salió mal. Inténtalo de nuevo.',
};

export const dictionaries: Record<Locale, Shape> = { en, es };

// Picks the first device language the app has a translation for, which is what
// the OS does when it matches an app to its preferred languages.
export function pickLocale(tags: readonly string[]): { locale: Locale; tag: string } {
  for (const tag of tags) {
    const lang = tag.toLowerCase().split(/[-_]/)[0];
    if (lang === 'es' || lang === 'en') return { locale: lang, tag: tag.replace('_', '-') };
  }
  return { locale: 'en', tag: 'en' };
}

function detect() {
  try {
    return pickLocale(getLocales().map((l) => l.languageTag));
  } catch {
    return pickLocale([]);
  }
}

const detected = detect();
export const locale: Locale = detected.locale;
export const dateLocale = detected.tag;

export function translate(loc: Locale, key: Key, params: Params = {}): string {
  const entry = dictionaries[loc][key];
  // English and Spanish share the one/other rule, so no Intl.PluralRules dependency.
  const raw = typeof entry === 'string' ? entry : Number(params.count) === 1 ? entry.one : entry.other;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

export const t = (key: Key, params?: Params) => translate(locale, key, params);
