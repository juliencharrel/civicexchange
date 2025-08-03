"use client";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="bg-primary text-white p-4">Test bg-primary</div>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="font-bold text-xl text-primary">CivicExchange</div>
        <nav className="hidden md:flex gap-6 items-center">
          <a href="#" className="hover:text-primary">Explorer</a>
          <a href="#" className="hover:text-primary">Domaines</a>
          <a href="#" className="hover:text-primary">Données</a>
          <a href="#" className="hover:text-primary">Réseau</a>
          <Button className="ml-4" variant="primary">Publier une initiative</Button>
        </nav>
        {/* Mobile menu */}
        <div className="md:hidden">
          <Menu as="div" className="relative">
            <Menu.Button as={Button} variant="ghost" className="p-2">
              <Bars3Icon className="h-6 w-6 text-primary" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                <Menu.Item>
                  {({ active }) => (
                    <Button as="a" href="#" className={`block w-full text-left px-4 py-2 ${active ? "bg-primary/10" : ""}`} variant="ghost">Explorer</Button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Button as="a" href="#" className={`block w-full text-left px-4 py-2 ${active ? "bg-primary/10" : ""}`} variant="ghost">Domaines</Button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Button as="a" href="#" className={`block w-full text-left px-4 py-2 ${active ? "bg-primary/10" : ""}`} variant="ghost">Données</Button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Button as="a" href="#" className={`block w-full text-left px-4 py-2 ${active ? "bg-primary/10" : ""}`} variant="ghost">Réseau</Button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Button className="w-full text-left px-4 py-2" variant="primary">Publier une initiative</Button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}