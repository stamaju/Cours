# Cours « L’IA pour les nuls » : version protégée

Les modules 2 à 7 (FR / EN / HT) ne sont **pas dans la page**. Ils sont dans `paid.json`, sur le serveur, et ne sont envoyés qu'avec un code d'accès valide (2 appareils maximum par code).

## 1. Mettre en ligne (Node 18 ou plus)
Hébergeurs possibles : Render, Railway, Fly.io ou un VPS. Il faut du **HTTPS**.

```
ADMIN_KEY="une-longue-phrase-secrete" SECRET="une-autre-longue-phrase" node server.js
```
Sur Render ou Railway, mettez `ADMIN_KEY` et `SECRET` dans les variables d'environnement. Les codes sont écrits dans `codes.json` : sur ces hébergeurs, attachez un disque persistant et indiquez son chemin avec `DB_FILE`, sinon les codes disparaissent à chaque redémarrage.

## 2. Configurer `index.html` (haut du script)
- `WA="509XXXXXXXX"` : votre numéro WhatsApp, pour recevoir les preuves de paiement.
- `PAY.moncash="+509 ..."`, `PAY.natcash="+509 ..."`, `PAY.paypal="https://paypal.me/..."` : vos moyens de paiement.
- `VIDEOS["0-fr"]="https://youtu.be/..."` : vos vraies vidéos (clé = numéro du module, tiret, langue).

## 3. Vendre un accès
1. Le client paie (MonCash, NatCash, etc.) et vous envoie la preuve sur WhatsApp.
2. Vous vérifiez le paiement, puis ouvrez dans le navigateur :
   `https://votre-site/admin/newcode?key=ADMIN_KEY&note=NomDuClient`
3. Vous envoyez le code `IA-XXXXXXXX` au client. Il le saisit dans l'app : les modules se débloquent.
- Retirer un accès : `/admin/revoke?key=ADMIN_KEY&code=IA-XXXXXXXX`
- Voir tous les codes et appareils : `/admin/list?key=ADMIN_KEY`

## Ce que cette protection fait, et ne fait pas
- Faire : le contenu payant n'existe pas dans le code de la page. Copier la page ne donne que le module gratuit. Un code partagé est limité à 2 appareils, et vous pouvez le révoquer.
- Ne pas faire : quelqu'un qui a payé peut encore photographier l'écran ou enregistrer une vidéo. Le filigrane (votre code sur chaque écran) permet de retrouver l'origine d'une fuite.
- Le paiement est vérifié **par vous**, à la main. L'automatiser demande une API de paiement (Stripe, ou l'API MonCash Business) reliée à `/admin/newcode`.
