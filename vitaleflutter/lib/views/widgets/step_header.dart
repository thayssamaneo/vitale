import 'package:material_ui/material_ui.dart';

import '../../app/vitale_theme.dart';

class StepHeader extends StatelessWidget {
  const StepHeader({required this.step, required this.title, super.key});

  final int step;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'ETAPA $step DE 3',
          style: const TextStyle(
            color: VitaleTheme.primary,
            fontSize: 13,
            fontWeight: FontWeight.w800,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall
              ?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 14),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: step / 3,
            minHeight: 8,
            backgroundColor: const Color(0xFFE7E2DE),
          ),
        ),
      ],
    );
  }
}
