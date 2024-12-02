# SL Report

## Deploy Angular app
Deployment can occur for two different environments i.e. staging and production. In both cases Angular needs to be built for --prod as Service Worker is enabled only for production.

## Deploying for production
Build angular for prod
```sh
[rajkaran@localhost lb-report]$ rm -rf public/*
[rajkaran@localhost ng-report]$ rm -rf dist/
[rajkaran@localhost ng-report]$ npx ng build --prod --base-href /
[rajkaran@localhost ng-isamreportskara]$ cp -a ng-report/dist/Samskara/. lb-report/public/
```

## Extra commands
* Build For specific configuration
```sh
$ npx ng build --configuration=raj --base-href /
$ npx ng build --configuration=staging --base-href /
```
* Run angular in development as it would in production
```sh
$ npx ng serve --host=192.168.0.25 --c=raj
$ npm run ng build --prod --configuration=production
```

## CLI Commands
```sh
$ npx ng g module core --module=app.module --routing
$ npx ng g module setting/keyValuePair --module=setting/setting.module
$ npx ng g c core/interactMessage --module=core.module
$ npx ng g interface core/models/authorizationMatrix model
$ npx ng g service core/services/helper
```

## Color Scheme
* success - 
* primary - update table / report, add property in form, submit a form, create a new entry in collection
* warning - edit an entry in collection
* danger - delete entry from collection, delete property from property, deactivate / decommision 
* secondary - cancel, close and back event

## Repeatedly used Icons for similar / same purpose
* `add_circle` is used for adding an element in an array. such as adding a new sub form of Address in Organization.
* `remove_circle` is used for removing an element from an array. such as removing an Address sub form from an Organization.
* `cancel` is used to remove a chip from chip list.
* `add` is used for create new button.
* `edit` is used in button to allow edit of an entity.
* `lock` is used for reset-password button
* `supervised_user_circle` is used to indicate that a user is an admin.
* `model_training` is used to load an item to the form on the same page for editing. such as key-value pair needs to be loaded before being edited.
* `polyline` when building / designing / connecting multiple entities
* `visibility` to make an item visible
* `visibility_off` tunr off a visible item. usually comes in combination with visibility icon.
* `diversity_2` group of entity which aren't people/user.

## Standards
* Add typings to everything.
* Wherever possible indicate data type of retunr from functions.