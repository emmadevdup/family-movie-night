type AvatarMeta = {
  name: string
  path: string
}

export const AVATAR_LIST: Record<string, AvatarMeta> = {
  // Emoji — animals & fantasy
  fox:        { name: 'Fox',        path: '/avatars/fox.svg' },
  wolf:       { name: 'Wolf',       path: '/avatars/wolf.svg' },
  dragon:     { name: 'Dragon',     path: '/avatars/dragon.svg' },
  unicorn:    { name: 'Unicorn',    path: '/avatars/unicorn.svg' },
  fish:       { name: 'Fish',       path: '/avatars/fish.svg' },
  owl:        { name: 'Owl',        path: '/avatars/owl.svg' },
  elf:        { name: 'Elf',        path: '/avatars/elf.svg' },
  // Emoji — adventure & royalty
  astronaut:  { name: 'Astronaut',  path: '/avatars/astronaut.svg' },
  princess:   { name: 'Princess',   path: '/avatars/princess.svg' },
  // DiceBear illustrated faces
  braids:         { name: 'Braids',         path: '/avatars/braids.svg' },
  curls:          { name: 'Curls',          path: '/avatars/curls.svg' },
  ponytail:       { name: 'Ponytail',       path: '/avatars/ponytail.svg' },
  cap:            { name: 'Cap',            path: '/avatars/cap.svg' },
  headphones:     { name: 'Headphones',     path: '/avatars/headphones.svg' },
  fringe:         { name: 'Fringe',         path: '/avatars/fringe.svg' },
  'cat-face':     { name: 'Cat',            path: '/avatars/cat-face.svg' },
  'fox-face':     { name: 'Fox Face',       path: '/avatars/fox-face.svg' },
  'astronaut-face': { name: 'Astronaut Face', path: '/avatars/astronaut-face.svg' },
  'wizard-face':  { name: 'Wizard',         path: '/avatars/wizard-face.svg' },
  'robot-face':   { name: 'Robot',          path: '/avatars/robot-face.svg' },
}

export const AVATAR_IDS = Object.keys(AVATAR_LIST)
