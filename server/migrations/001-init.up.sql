create table Projects (
  id integer primary key autoincrement,
  name text not null,
  referenceText,
  referenceLink,
  form text not null,
  hash text not null,
  status text default 'PAUSE'
);

create table Images (
  id integer primary key autoincrement,
  originalName text not null,
  link text not null,
  externalLink text,
  localPath text,
  labeled boolean,
  labelData text not null, /* JSON-stringified data, matching the form data in the project */
  lastEdited real default 0.0,
  desc text default '',
  inspected boolean,
  projectsId integer,
  constraint images_fk_projectsId foreign key (projectsId) references Projects (id) on delete cascade
);

create table Comments (
  id integer primary key autoincrement,
  comment text default '',
  createdAt real default 0.0,
  imagesId integer,
  constraint comments_fk_imagesId foreign key (imagesId) references Images (id) on delete cascade
);

create table MLModels (
  id integer primary key autoincrement,
  name text not null,
  url text not null,
  type text not null
);

insert into projects (name, form, hash) values ('Test Project', '{ "formParts": [ { "type": "polygon", "name": "Car", "id": "nfjxui" }, { "type": "bbox", "name": "Windows", "id": "n3ndi88" } ] }', '710b962e-041c-11e1-9234-0123456789ab');
insert into images (originalName, link, labeled, labelData, projectsId) values ('tesla.jpg', '/uploads/1/1.jpg', 0, '{ }', 1);
