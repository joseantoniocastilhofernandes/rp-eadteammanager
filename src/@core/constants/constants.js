import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'
export const SERVICES_CONTEXT = "https://api-gestao-de-ead.estudeondequiser.com.br/api"; //prod
//export const SERVICES_CONTEXT = "http://localhost:8080/eadmanager-app/api"; //dev
var loggedUser = '';

export function setLoggedUser(user){
	loggedUser = user;
}

export function getLoggedUser(){
	return loggedUser;
}