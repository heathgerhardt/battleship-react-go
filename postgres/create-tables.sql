create table shots (
	id serial primary key,
	result boolean not null,
	board_row integer not null,
	board_column integer not null
);
