"""
Comunicador A2A (Agent-to-Agent)
================================
Script de utilidad para comunicación inter-grupo en el Conglomerado de Skills.

Este módulo implementa el protocolo A2A para:
- Envío de mensajes entre Células de Habilidad
- Prevención de bucles infinitos (Max Hops)
- Detección de ciclos
- Manejo de timeouts y reintentos
"""

import uuid
import json
import time
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any
from enum import Enum
from pathlib import Path


class RequestType(Enum):
    """Tipos de solicitud A2A."""
    QUERY = "query"      # Consulta de información
    TASK = "task"        # Solicitud de tarea
    ARTIFACT = "artifact"  # Solicitud de artefacto


class Priority(Enum):
    """Prioridades de mensaje."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ResponseStatus(Enum):
    """Estados de respuesta."""
    SUCCESS = "success"
    ERROR = "error"
    TIMEOUT = "timeout"


class CommunicatorError(Exception):
    """Excepción base para errores del comunicador."""
    pass


class MaxHopsExceededError(CommunicatorError):
    """Error cuando se excede el límite de saltos."""
    pass


class CycleDetectedError(CommunicatorError):
    """Error cuando se detecta un ciclo de comunicación."""
    pass


class GroupNotFoundError(CommunicatorError):
    """Error cuando el grupo destino no existe."""
    pass


# Configuración global
MAX_HOPS = 5
DEFAULT_TIMEOUT = 30
RETRY_ATTEMPTS = 3

# Registro de trace_ids procesados (para detección de ciclos)
_processed_traces: Dict[str, List[str]] = {}


@dataclass
class A2AMessage:
    """Estructura de un mensaje A2A."""
    trace_id: str
    hop_count: int
    source_group: str
    target_group: str
    request_type: RequestType
    payload: Dict[str, Any]
    priority: Priority = Priority.MEDIUM
    timeout_seconds: int = DEFAULT_TIMEOUT
    
    @classmethod
    def create(
        cls,
        source_group: str,
        target_group: str,
        request_type: RequestType,
        payload: Dict[str, Any],
        priority: Priority = Priority.MEDIUM,
        parent_trace_id: Optional[str] = None,
        current_hop_count: int = 0
    ) -> "A2AMessage":
        """Crea un nuevo mensaje A2A."""
        return cls(
            trace_id=parent_trace_id or str(uuid.uuid4()),
            hop_count=current_hop_count,
            source_group=source_group,
            target_group=target_group,
            request_type=request_type,
            payload=payload,
            priority=priority
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el mensaje a diccionario."""
        data = asdict(self)
        data["request_type"] = self.request_type.value
        data["priority"] = self.priority.value
        return data
    
    def to_json(self) -> str:
        """Convierte el mensaje a JSON."""
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class A2AResponse:
    """Estructura de una respuesta A2A."""
    trace_id: str
    status: ResponseStatus
    source_group: str
    payload: Dict[str, Any]
    processing_time_ms: int = 0
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    
    @classmethod
    def success(
        cls,
        trace_id: str,
        source_group: str,
        payload: Dict[str, Any],
        processing_time_ms: int = 0
    ) -> "A2AResponse":
        """Crea una respuesta exitosa."""
        return cls(
            trace_id=trace_id,
            status=ResponseStatus.SUCCESS,
            source_group=source_group,
            payload=payload,
            processing_time_ms=processing_time_ms
        )
    
    @classmethod
    def error(
        cls,
        trace_id: str,
        source_group: str,
        error_code: str,
        error_message: str
    ) -> "A2AResponse":
        """Crea una respuesta de error."""
        return cls(
            trace_id=trace_id,
            status=ResponseStatus.ERROR,
            source_group=source_group,
            payload={},
            error_code=error_code,
            error_message=error_message
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte la respuesta a diccionario."""
        data = asdict(self)
        data["status"] = self.status.value
        return data
    
    def to_json(self) -> str:
        """Convierte la respuesta a JSON."""
        return json.dumps(self.to_dict(), indent=2)


def validate_hop_count(message: A2AMessage) -> None:
    """
    Valida el contador de saltos para prevenir bucles infinitos.
    
    Raises:
        MaxHopsExceededError: Si se excede el límite de saltos.
    """
    if message.hop_count >= MAX_HOPS:
        raise MaxHopsExceededError(
            f"Se excedió el límite de {MAX_HOPS} saltos. "
            f"Trace ID: {message.trace_id}, "
            f"Hop count: {message.hop_count}"
        )


def detect_cycle(message: A2AMessage) -> None:
    """
    Detecta ciclos de comunicación.
    
    Raises:
        CycleDetectedError: Si se detecta un ciclo.
    """
    trace_id = message.trace_id
    target = message.target_group
    
    if trace_id in _processed_traces:
        if target in _processed_traces[trace_id]:
            raise CycleDetectedError(
                f"Ciclo detectado: El grupo {target} ya procesó "
                f"el trace_id {trace_id}"
            )
    
    # Registrar este procesamiento
    if trace_id not in _processed_traces:
        _processed_traces[trace_id] = []
    _processed_traces[trace_id].append(target)


def load_group_registry() -> Dict[str, Any]:
    """
    Carga el registro de grupos desde registry.yaml.
    
    Returns:
        Diccionario con la configuración de grupos.
    """
    registry_path = Path(__file__).parent.parent.parent / "00-master-architect" / "registry.yaml"
    
    if not registry_path.exists():
        return {"groups": {}}
    
    try:
        import yaml
        with open(registry_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except ImportError:
        # Fallback si PyYAML no está disponible
        return {"groups": {}}


def get_group_info(group_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene información de un grupo por su ID.
    
    Args:
        group_id: ID del grupo (ej: "10-backend-group")
    
    Returns:
        Información del grupo o None si no existe.
    """
    registry = load_group_registry()
    groups = registry.get("groups", {})
    
    for group in groups.values():
        if group.get("id") == group_id:
            return group
    
    return None


def send_message(message: A2AMessage) -> A2AResponse:
    """
    Envía un mensaje A2A a otro grupo.
    
    Args:
        message: Mensaje A2A a enviar.
    
    Returns:
        Respuesta A2A del grupo destino.
    
    Raises:
        MaxHopsExceededError: Si se excede el límite de saltos.
        CycleDetectedError: Si se detecta un ciclo.
        GroupNotFoundError: Si el grupo destino no existe.
    """
    start_time = time.time()
    
    # Validaciones
    validate_hop_count(message)
    detect_cycle(message)
    
    # Verificar que el grupo destino existe
    target_info = get_group_info(message.target_group)
    if not target_info:
        raise GroupNotFoundError(
            f"Grupo no encontrado: {message.target_group}"
        )
    
    # Incrementar hop count para el siguiente salto
    message.hop_count += 1
    
    # En una implementación real, aquí se haría la llamada RPC/HTTP
    # Por ahora, simulamos un procesamiento local
    
    processing_time = int((time.time() - start_time) * 1000)
    
    # Respuesta simulada
    return A2AResponse.success(
        trace_id=message.trace_id,
        source_group=message.target_group,
        payload={
            "received": True,
            "message": f"Mensaje recibido por {message.target_group}",
            "original_question": message.payload.get("question", "N/A")
        },
        processing_time_ms=processing_time
    )


def create_query_message(
    source_group: str,
    target_group: str,
    question: str,
    context: str = "",
    priority: Priority = Priority.MEDIUM
) -> A2AMessage:
    """
    Crea un mensaje de consulta.
    
    Args:
        source_group: Grupo origen.
        target_group: Grupo destino.
        question: Pregunta a realizar.
        context: Contexto adicional.
        priority: Prioridad del mensaje.
    
    Returns:
        Mensaje A2A configurado.
    """
    return A2AMessage.create(
        source_group=source_group,
        target_group=target_group,
        request_type=RequestType.QUERY,
        payload={
            "question": question,
            "context": context
        },
        priority=priority
    )


def create_task_message(
    source_group: str,
    target_group: str,
    task: str,
    artifacts: List[str] = None,
    priority: Priority = Priority.MEDIUM
) -> A2AMessage:
    """
    Crea un mensaje de solicitud de tarea.
    
    Args:
        source_group: Grupo origen.
        target_group: Grupo destino.
        task: Descripción de la tarea.
        artifacts: Lista de rutas a artefactos.
        priority: Prioridad del mensaje.
    
    Returns:
        Mensaje A2A configurado.
    """
    return A2AMessage.create(
        source_group=source_group,
        target_group=target_group,
        request_type=RequestType.TASK,
        payload={
            "task": task,
            "artifacts": artifacts or []
        },
        priority=priority
    )


def clear_trace_history() -> None:
    """Limpia el historial de traces procesados."""
    global _processed_traces
    _processed_traces = {}


# Ejemplo de uso
if __name__ == "__main__":
    # Crear un mensaje de consulta
    msg = create_query_message(
        source_group="10-backend-group",
        target_group="20-frontend-group",
        question="¿Qué campos son obligatorios en el formulario de registro?",
        context="Diseñando tabla de usuarios en PostgreSQL",
        priority=Priority.HIGH
    )
    
    print("=== Mensaje A2A ===")
    print(msg.to_json())
    
    try:
        response = send_message(msg)
        print("\n=== Respuesta A2A ===")
        print(response.to_json())
    except CommunicatorError as e:
        print(f"\n=== Error ===")
        print(f"Tipo: {type(e).__name__}")
        print(f"Mensaje: {e}")
