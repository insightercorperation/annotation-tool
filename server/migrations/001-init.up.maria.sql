create table projects (
  `id` integer primary key auto_increment,
  `name` text not null,
  `referenceText` text,
  `referenceLink` text,
  `form` text not null,
  `hash` text not null,
  `status` text default 'PAUSE'
);

create table images (
  `id` integer primary key auto_increment,
  `originalName` text not null,
  `link` text not null,
  `externalLink` text,
  `localPath` text,
  `labeled` boolean,
  `labelData` text not null, /* JSON-stringified data, matching the form data in the project */
  `lastEdited` real default 0.0,
  `desc` text default '',
  `inspected` boolean,
  `projectsId` integer,
  constraint images_fk_projectsId foreign key (projectsId) references projects (id) on delete cascade
);

create table comments (
  `id` integer primary key auto_increment,
  `comment` text default '',
  `createdAt` real default 0.0,
  `imagesId` integer,
  constraint comments_fk_imagesId foreign key (imagesId) references images (id) on delete cascade
);

create table mlmodels (
  `id` integer primary key auto_increment,
  `name` text not null,
  `url` text not null,
  `type` text not null
);
