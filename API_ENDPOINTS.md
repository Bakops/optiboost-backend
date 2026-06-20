# Endpoints API Backend Optiboost

## URL de base

- Préfixe : `/api/v1`
- Port par défaut : `3000`
- Port de secours si `3000` est occupé : `3002`

Exemples :

- `http://localhost:3000/api/v1`
- `http://localhost:3002/api/v1`

## Racine

- `GET /api/v1`
  - Retourne les métadonnées de l'API et les modules disponibles.

## Authentification

- `POST /api/v1/auth/register`
  - Body : `email`, `password`, `firstName?`, `lastName?`, `organizationName?`

- `POST /api/v1/auth/login`
  - Body : `email`, `password`

- `POST /api/v1/auth/google`
  - Body : `idToken?`, `email?`

- `POST /api/v1/auth/refresh`
  - Body : `refreshToken?`

- `POST /api/v1/auth/logout`
  - Body : `refreshToken?`

- `POST /api/v1/auth/forgot-password`
  - Body : `email`

- `POST /api/v1/auth/reset-password`
  - Body : `token`, `password`

- `GET /api/v1/auth/me`
  - Retourne l'utilisateur courant et son organisation.

## Tableau de bord

- `GET /api/v1/dashboard/overview`
  - Retourne les KPI du tableau de bord.

- `GET /api/v1/dashboard/recent-clients`
  - Retourne les clients récents pour le tableau de la page d'accueil.

- `GET /api/v1/dashboard/campaigns-summary`
  - Retourne le résumé des campagnes récentes.

## Clients

- `GET /api/v1/clients`
  - Paramètres de requête : `search?`, `status?`, `category?`, `page?`, `limit?`, `sortBy?`, `sortOrder?`

- `GET /api/v1/clients/stats/segments`
  - Retourne le nombre de clients par segment.

- `GET /api/v1/clients/:id`
  - Retourne un client avec son historique d'achats.

- `POST /api/v1/clients`
  - Body : `firstName?`, `lastName?`, `email?`, `phone?`, `category?`, `status?`, `totalSpent?`

- `PATCH /api/v1/clients/:id`
  - Body : `firstName?`, `lastName?`, `email?`, `phone?`, `category?`, `status?`, `totalSpent?`

- `DELETE /api/v1/clients/:id`
  - Supprime logiquement un client.

- `POST /api/v1/clients/:id/relance`
  - Body : `channel`, `template?`
  - Valeurs possibles pour `channel` : `email`, `sms`, `whatsapp`

## Imports

- `GET /api/v1/imports`
  - Retourne les imports.

- `POST /api/v1/imports`
  - Body : `fileName?`, `totalRows?`

- `GET /api/v1/imports/:id/errors`
  - Retourne les lignes rejetées pour un import.

- `GET /api/v1/imports/:id`
  - Retourne un import.

## Campagnes

- `GET /api/v1/campaigns`
  - Paramètres de requête : `status?`, `channel?`

- `POST /api/v1/campaigns`
  - Body : `name`, `channel`, `segmentId`, `messageTemplate`, `scheduledAt?`

- `GET /api/v1/campaigns/:id/recipients`
  - Retourne les destinataires d'une campagne.

- `GET /api/v1/campaigns/:id/analytics`
  - Retourne les statistiques d'une campagne.

- `POST /api/v1/campaigns/:id/launch`
  - Lance une campagne.

- `POST /api/v1/campaigns/:id/pause`
  - Met une campagne en pause.

- `POST /api/v1/campaigns/:id/cancel`
  - Annule une campagne.

- `PATCH /api/v1/campaigns/:id`
  - Body : `name?`, `scheduledAt?`, `messageTemplate?`

- `GET /api/v1/campaigns/:id`
  - Retourne une campagne avec ses statistiques.

## Achats

- `GET /api/v1/purchases`
  - Retourne tous les achats.

- `POST /api/v1/purchases`
  - Body : `clientId`, `amount`, `productType`, `productCategory`, `purchasedAt?`

- `GET /api/v1/clients/:id/purchases`
  - Retourne les achats d'un client.

## Segments

- `GET /api/v1/segments`
  - Retourne tous les segments.

- `POST /api/v1/segments`
  - Body : `name`, `rules`

- `GET /api/v1/segments/:id/clients`
  - Retourne les clients correspondant au segment.

- `GET /api/v1/segments/:id`
  - Retourne un segment.

- `PATCH /api/v1/segments/:id`
  - Body : `name?`, `rules?`

- `DELETE /api/v1/segments/:id`
  - Supprime un segment.

## Simulateur

- `POST /api/v1/simulator/estimate`
  - Body : `inactiveClients`, `averageBasket`, `conversionRate`

- `GET /api/v1/simulator/defaults`
  - Retourne les valeurs par défaut du simulateur.

## Templates et messages

- `GET /api/v1/templates`
  - Retourne tous les templates.

- `POST /api/v1/templates`
  - Body : `name`, `channel`, `content`

- `PATCH /api/v1/templates/:id`
  - Body : `name?`, `content?`

- `DELETE /api/v1/templates/:id`
  - Supprime un template.

- `POST /api/v1/messages/preview`
  - Body : `template`, `variables?`
  - Retourne le texte rendu après remplacement des variables.