'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';

export interface MenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface DropdownMenuProps {
  items: MenuItem[];
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export function DropdownMenu({ 
  items, 
  className,
  buttonClassName,
  menuClassName 
}: DropdownMenuProps) {
  const { theme } = useTheme();
  
  return (
    <Menu as="div" className={cn('relative', className)}>
      {({ open }) => (
        <>
          <Menu.Button 
            className={cn(
              'p-1.5 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
              buttonClassName
            )}
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-muted-foreground" />
          </Menu.Button>

          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items 
              className={cn(
                'absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-background border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50',
                menuClassName
              )}
            >
              <div className="py-1">
                {items.map((item, index) => (
                  <Menu.Item key={index}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        className={cn(
                          'group flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer focus:outline-none',
                          item.variant === 'danger' 
                            ? cn(
                                'text-destructive',
                                theme === 'dark' 
                                  ? 'hover:bg-red-900/30 focus:bg-red-900/30' 
                                  : 'hover:bg-red-50 focus:bg-red-50',
                                active && (theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50')
                              )
                            : cn(
                                'text-foreground',
                                theme === 'dark' 
                                  ? 'hover:bg-gray-700 focus:bg-gray-700' 
                                  : 'hover:bg-gray-100 focus:bg-gray-100',
                                active && (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')
                              )
                        )}
                      >
                        {item.icon && (
                          <span className={cn(
                            'transition-colors duration-200',
                            item.variant === 'danger' 
                              ? 'text-destructive' 
                              : theme === 'dark' 
                                ? 'text-gray-400 group-hover:text-gray-200' 
                                : 'text-gray-500 group-hover:text-gray-700'
                          )}>
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}