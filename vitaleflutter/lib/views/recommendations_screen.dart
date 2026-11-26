import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../app/app_routes.dart';
import '../app/vitale_theme.dart';
import '../controllers/emergency_call_controller.dart';
import '../models/triage_result.dart';
import 'widgets/step_header.dart';

class RecommendationsScreen extends StatefulWidget {
  const RecommendationsScreen({required this.result, super.key});

  final TriageResult result;

  @override
  State<RecommendationsScreen> createState() => _RecommendationsScreenState();
}

class _RecommendationsScreenState extends State<RecommendationsScreen> {
  final _callController = EmergencyCallController();
  bool _isOpeningDialer = false;

  Future<void> _openDialer() async {
    setState(() => _isOpeningDialer = true);
    try {
      final opened = await _callController.openDialer(
        widget.result.profile.emergencyPhone,
      );
      if (!mounted) {
        return;
      }
      if (!opened) {
        _showDialerError();
      }
    } on PlatformException {
      if (mounted) {
        _showDialerError();
      }
    } finally {
      if (mounted) {
        setState(() => _isOpeningDialer = false);
      }
    }
  }

  void _showDialerError() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Não foi possível abrir o discador neste aparelho.'),
      ),
    );
  }

  void _startAgain() {
    Navigator.pushReplacementNamed(
      context,
      AppRoutes.symptoms,
      arguments: widget.result.profile,
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.result.profile;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Orientações'),
        leading: IconButton(
          tooltip: 'Voltar',
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        children: [
          const StepHeader(step: 3, title: 'Você não está sozinho.'),
          const SizedBox(height: 12),
          Text(
            'Estas são as regiões que você selecionou. Esta tela é um protótipo '
            'e não avalia a gravidade dos sintomas.',
            style: Theme.of(context).textTheme.bodyLarge
                ?.copyWith(color: const Color(0xFF625D59), height: 1.45),
          ),
          const SizedBox(height: 18),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Regiões sinalizadas',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  ...widget.result.selectedAreas.map(
                    (area) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle,
                            color: VitaleTheme.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              '${area.name} · '
                              '${widget.result.severityByArea[area.id] ?? 'Moderada'}',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            color: const Color(0xFFE5F6F3),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.favorite_outline, color: VitaleTheme.primary),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Contato de confiança',
                          style: TextStyle(
                            color: Color(0xFF075E57),
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    profile.emergencyContactName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('${profile.relationship} · ${profile.emergencyPhone}'),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _isOpeningDialer ? null : _openDialer,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFB42318),
                      foregroundColor: Colors.white,
                    ),
                    icon: _isOpeningDialer
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.call),
                    label: Text(
                      _isOpeningDialer
                          ? 'Abrindo o discador...'
                          : 'Ligar para ${profile.emergencyContactName}',
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'O discador será aberto para você revisar e iniciar a ligação.',
                    style: TextStyle(color: Color(0xFF4D5C57), height: 1.4),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Enquanto isso',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Se estiver se sentindo mal, procure um local seguro e '
                    'peça ajuda a alguém próximo. Se for uma emergência, '
                    'ligue para o serviço de emergência local.',
                    style: Theme.of(context).textTheme.bodyLarge
                        ?.copyWith(height: 1.45),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          OutlinedButton(
            onPressed: _startAgain,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              foregroundColor: VitaleTheme.primary,
              side: const BorderSide(color: VitaleTheme.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: const Text(
              'Iniciar uma nova avaliação',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
