export interface Usuario{
    id :number,
    estadoId :number,
    companiaId :number,
    rolId :number,
    nombre :string,
    apellido :string,
    email :string,
    password :string,
    maxintentos :number,
    intentosfallidos :number,
}