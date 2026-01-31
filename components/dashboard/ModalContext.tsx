"use client";
import { createContext, useContext } from "react";

const ModalContext = createContext<boolean>(false);

export const ModalProvider = ModalContext.Provider;

export const useModal = () => useContext(ModalContext);
