import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'
export const SERVICES_CONTEXT = "http://api-gestao-de-ead.estudeondequiser.com.br/api";
var loggedUser = '';

export function setLoggedUser(user){
	loggedUser = user;
}

export function getLoggedUser(){
	return loggedUser;
}