from app.models import Trabajo

def generar_contenido_txt(trabajo: Trabajo) -> str:
    """
    Genera la cadena de texto tabulada para el optimizador .txt
    respetando el formato exacto de la aplicación.
    """
    cortes_txt = ""
    
    for c in trabajo.cortes:
        cant = c.cantidad
        largo = c.largo_mm
        ancho = c.ancho_mm
        descripcion = c.descripcion
        tl = c.tapacanto_largo
        ta = c.tapacanto_ancho
        
        # Leemos el flag de rotación de cada corte (1 o 0)
        rota_val = 1 if c.puede_rotar else 0

        # Lógica de conversión de tapacantos a lados
        if tl == 1:
            canto_arr, canto_aba = 1, 0
        elif tl == 2:
            canto_arr, canto_aba = 1, 1
        elif tl == 3:
            canto_arr, canto_aba = 2, 0
        elif tl == 4:
            canto_arr, canto_aba = 2, 2
        else:
            canto_arr, canto_aba = 0, 0

        if ta == 1:
            canto_izq, canto_der = 1, 0
        elif ta == 2:
            canto_izq, canto_der = 1, 1
        elif ta == 3:
            canto_izq, canto_der = 2, 0
        elif ta == 4:
            canto_izq, canto_der = 2, 2
        else:
            canto_izq, canto_der = 0, 0

        # Construcción de la cadena de texto tabulada exacta
        cortes_txt += f"{cant}\t{largo}\t{ancho}\t{descripcion}\t{rota_val}\t"
        cortes_txt += f"{canto_arr}\t{canto_aba}\t{canto_izq}\t{canto_der}\n"

    return cortes_txt
