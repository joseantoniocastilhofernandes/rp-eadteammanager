import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'
export const SERVICES_CONTEXT = "http://localhost:8080/EadManager/rest";
var loggedUser = '';

export function setLoggedUser(user){
	loggedUser = user;
}

export function getLoggedUser(){
	return loggedUser;
}