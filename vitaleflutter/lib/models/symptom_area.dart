import 'package:material_ui/material_ui.dart';

class SymptomArea {
  const SymptomArea({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
  });

  final String id;
  final String name;
  final String description;
  final IconData icon;

  static const all = <SymptomArea>[
    SymptomArea(
      id: 'head',
      name: 'Cabeça e crânio',
      description: 'Dor de cabeça, tontura ou pressão',
      icon: Icons.face_outlined,
    ),
    SymptomArea(
      id: 'eyes',
      name: 'Olhos e ouvidos',
      description: 'Visão embaçada, zumbido ou irritação',
      icon: Icons.visibility_outlined,
    ),
    SymptomArea(
      id: 'throat',
      name: 'Garganta e pescoço',
      description: 'Dor, rouquidão ou dificuldade para engolir',
      icon: Icons.record_voice_over_outlined,
    ),
    SymptomArea(
      id: 'chest',
      name: 'Peito e pulmão',
      description: 'Dor no peito, tosse ou falta de ar',
      icon: Icons.favorite_border,
    ),
    SymptomArea(
      id: 'stomach',
      name: 'Estômago e barriga',
      description: 'Azia, cólica ou náusea',
      icon: Icons.restaurant_outlined,
    ),
    SymptomArea(
      id: 'back',
      name: 'Costas e lombar',
      description: 'Dor nas costas ou na coluna',
      icon: Icons.accessibility_new,
    ),
    SymptomArea(
      id: 'arms',
      name: 'Braços e mãos',
      description: 'Dor, dormência ou fraqueza',
      icon: Icons.pan_tool_outlined,
    ),
    SymptomArea(
      id: 'legs',
      name: 'Pernas e joelhos',
      description: 'Dor, inchaço ou dificuldade para caminhar',
      icon: Icons.directions_walk_outlined,
    ),
    SymptomArea(
      id: 'feet',
      name: 'Pés e tornozelos',
      description: 'Queimação, formigamento ou inchaço',
      icon: Icons.directions_run_outlined,
    ),
  ];

  @override
  bool operator ==(Object other) => other is SymptomArea && other.id == id;

  @override
  int get hashCode => id.hashCode;
}
