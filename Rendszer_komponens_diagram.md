%%{init: {'theme': 'default'}}%%
usecaseDiagram
title Új Hozzáférési Kérelem Folyamata

actor "Felhasználó\n(Kérelmező)" as User
actor "Rendszer-\nadminisztrátor" as Admin

rectangle "Nyilvántartó Rendszer" {
  usecase "Bejelentkezés" as UC1
  usecase "Hozzáférés igénylése" as UC2
  usecase "Kérelem elbírálása" as UC3
  usecase "Értesítés küldése" as UC4
  usecase "Jogosultság rögzítése" as UC5
  usecase "Feladat (Ticket) létrehozása" as UC6
}

User --> UC1
User --> UC2

Admin --> UC1
Admin --> UC3

UC2 ..> UC4 : <<include>>
UC3 ..> UC5 : <<include>>
UC3 ..> UC6 : <<include>>

UC4 ..> Admin : értesíti
