// src/i18n/navigation.ts
'use client';

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';  // import từ file trên

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);