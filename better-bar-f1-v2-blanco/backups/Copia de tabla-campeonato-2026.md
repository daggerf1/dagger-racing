---
layout: ../layouts/MoldeDiario.astro
---
<div class="contenedor-campeonato">
    <h2 class="titulo-tabla">TEMPORADA OFICIAL</h2>
    
    <div class="tabla-f1">
        <!-- Encabezado de la Tabla -->
        <div class="fila-tabla encabezado">
            <div class="col-pos">POS</div>
            <div class="col-piloto">PILOTO</div>
            <div class="col-equipo">EQUIPO</div>
            <div class="col-puntos">PTS</div>
        </div>

        <!-- Fila Posición 1 (Podio Oro) -->
        <div class="fila-tabla posicion-1">
            <div class="col-pos">1</div>
            <div class="col-piloto">Max Verstappen 🇳🇱</div>
            <div class="col-equipo text-mutado">Red Bull Racing</div>
            <div class="col-puntos total-pts">25</div>
        </div>

        <!-- Fila Posición 2 (Podio Plata) -->
        <div class="fila-tabla posicion-2">
            <div class="col-pos">2</div>
            <div class="col-piloto">Lando Norris 🇬🇧</div>
            <div class="col-equipo text-mutado">McLaren</div>
            <div class="col-puntos total-pts">18</div>
        </div>

        <!-- Fila Posición 3 (Podio Bronce) -->
        <div class="fila-tabla posicion-3">
            <div class="col-pos">3</div>
            <div class="col-piloto">Charles Leclerc 🇲🇨</div>
            <div class="col-equipo text-mutado">Ferrari</div>
            <div class="col-puntos total-pts">15</div>
        </div>

        <!-- Fila Normal -->
        <div class="fila-tabla">
            <div class="col-pos">4</div>
            <div class="col-piloto">Oscar Piastri 🇦🇺</div>
            <div class="col-equipo text-mutado">McLaren</div>
            <div class="col-puntos">12</div>
        </div>

        <!-- Fila Normal -->
        <div class="fila-tabla">
            <div class="col-pos">5</div>
            <div class="col-piloto">Carlos Sainz 🇪🇸</div>
            <div class="col-equipo text-mutado">Ferrari</div>
            <div class="col-puntos">10</div>
        </div>

        <!-- Contenedor para filas ocultas/desplegables -->
        <div class="filas-tabla-ocultas">
            <div class="fila-tabla">
                <div class="col-pos">6</div>
                <div class="col-piloto">Lewis Hamilton 🇬🇧</div>
                <div class="col-equipo text-mutado">Mercedes</div>
                <div class="col-puntos">8</div>
            </div>
            <div class="fila-tabla">
                <div class="col-pos">7</div>
                <div class="col-piloto">George Russell 🇬🇧</div>
                <div class="col-equipo text-mutado">Mercedes</div>
                <div class="col-puntos">6</div>
            </div>
            <div class="fila-tabla">
                <div class="col-pos">8</div>
                <div class="col-piloto">Sergio Pérez 🇲🇽</div>
                <div class="col-equipo text-mutado">Red Bull Racing</div>
                <div class="col-puntos">4</div>
            </div>
        </div>

        <!-- Botón para interactividad del despliegue -->
        <button class="boton-desplegar" id="btn-desplegar-tiempos">
            Ver resto de posiciones ↓
        </button>
    </div>
</div>
