import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'
export const SERVICES_CONTEXT = "https://api-gestao-de-ead.estudeondequiser.com.br/api"; //prod
export const MIXPANEL_TOKEN = "32d1a11ed1eae600a6a4437dccdb4b2c";
//export const SERVICES_CONTEXT = "http://localhost:8080/eadmanager-app/api"; //dev
var loggedUser = '';

export function setLoggedUser(user){
	loggedUser = user;
}

export function getLoggedUser(){
	return loggedUser;
}