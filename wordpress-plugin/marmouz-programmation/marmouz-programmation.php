<?php
/**
 * Plugin Name: Marmouz Programmation
 * Description: Shortcode [marmouz_programmation] pour afficher la programmation depuis booking.laguinguettedesmarmouz.fr.
 * Version: 2.1.0
 * Author: La Guinguette des Marmouz
 */

if (!defined('ABSPATH')) {
    exit;
}

function marmouz_programmation_enqueue_assets() {
    wp_register_style(
        'marmouz-programmation-style',
        plugin_dir_url(__FILE__) . 'style.css',
        array(),
        '2.1.0'
    );
}
add_action('wp_enqueue_scripts', 'marmouz_programmation_enqueue_assets');

function marmouz_programmation_shortcode($atts) {
    $atts = shortcode_atts(
        array(
            'api' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-public',
            'calendar_feed' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-calendar.ics',
            'cta_url' => 'https://booking.laguinguettedesmarmouz.fr/',
            'cta_label' => 'Viens te produire a la Guinguette',
            'max' => 0,
            'show_details' => '1',
            'show_share' => '1',
            'show_booking_link' => '0',
        ),
        $atts,
        'marmouz_programmation'
    );

    $response = wp_remote_get($atts['api'], array('timeout' => 12));
    if (is_wp_error($response)) {
        return '<div class="marmouz-programmation-error">Programmation indisponible pour le moment.</div>';
    }

    $body = wp_remote_retrieve_body($response);
    $json = json_decode($body, true);

    if (!is_array($json) || !isset($json['items']) || !is_array($json['items'])) {
        return '<div class="marmouz-programmation-error">Aucune programmation disponible.</div>';
    }

    $items = $json['items'];
    $max = intval($atts['max']);
    $show_details = $atts['show_details'] === '1';
    $show_share = $atts['show_share'] === '1';
    $show_booking_link = $atts['show_booking_link'] === '1';
    $calendar_feed = esc_url_raw($atts['calendar_feed']);
    $calendar_feed_webcal = preg_replace('/^https?:/i', 'webcal:', $calendar_feed);
    $calendar_google = 'https://calendar.google.com/calendar/u/0/r?cid=' . rawurlencode($calendar_feed_webcal);
    $page_url = get_permalink();
    if ($max > 0) {
        $items = array_slice($items, 0, $max);
    }

    wp_enqueue_style('marmouz-programmation-style');
    $root_id = 'marmouz-programmation-' . wp_generate_password(8, false, false);

    ob_start();
    ?>
    <section id="<?php echo esc_attr($root_id); ?>" class="marmouz-programmation">
        <div class="marmouz-programmation-head">
            <h2>Programmation</h2>
            <a class="marmouz-cta" href="<?php echo esc_url($atts['cta_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($atts['cta_label']); ?></a>
        </div>
        <div class="marmouz-calendar-row">
            <a class="marmouz-calendar-btn" href="<?php echo esc_url($calendar_google); ?>" target="_blank" rel="noopener noreferrer">S'abonner Google</a>
            <a class="marmouz-calendar-btn" href="<?php echo esc_url($calendar_feed_webcal); ?>">S'abonner iCal/Apple</a>
            <a class="marmouz-calendar-btn" href="<?php echo esc_url($calendar_feed); ?>" target="_blank" rel="noopener noreferrer">Telecharger .ics</a>
        </div>

        <?php if (empty($items)) : ?>
            <article class="marmouz-card"><p>Aucune date confirmee pour l'instant.</p></article>
        <?php else : ?>
            <div class="marmouz-list">
                <?php foreach ($items as $item) : ?>
                                        <?php
                                        $detail_url = !empty($item['detail_url']) ? $item['detail_url'] : '';
                                        $event_anchor = !empty($item['id']) ? sanitize_title($item['id']) : wp_generate_password(6, false, false);
                                        $share_url = $page_url ? ($page_url . '#marmouz-event-' . $event_anchor) : $detail_url;
                                        $event_title = !empty($item['event_title']) ? $item['event_title'] : 'Evenement';
                                        $share_text = 'Decouvrez ' . $event_title . ' a La Guinguette des Marmouz : ' . $share_url;
                                        $whatsapp_url = 'https://wa.me/?text=' . rawurlencode($share_text);
                                        $facebook_url = 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode($share_url);
                                        $bluesky_url = 'https://bsky.app/intent/compose?text=' . rawurlencode($share_text);
                                        ?>
                    <article class="marmouz-card" id="marmouz-event-<?php echo esc_attr($event_anchor); ?>">
                        <p class="marmouz-date"><?php echo esc_html($item['date_label']); ?></p>
                        <h3><?php echo esc_html($item['event_title']); ?></h3>
                        <p class="marmouz-subtitle"><?php echo esc_html($item['subtitle']); ?></p>
                        <?php if (!empty($item['location'])) : ?>
                            <p class="marmouz-location"><?php echo esc_html($item['location']); ?></p>
                        <?php endif; ?>
                                                <?php if ($show_details && !empty($item['details'])) : ?>
                                                        <details class="marmouz-details-wrap">
                                                            <summary>Voir plus de details</summary>
                                                                <p class="marmouz-details"><?php echo nl2br(esc_html($item['details'])); ?></p>
                                                        </details>
                        <?php endif; ?>
                        <?php if (!empty($item['photo_url'])) : ?>
                            <img class="marmouz-photo" src="<?php echo esc_url($item['photo_url']); ?>" alt="<?php echo esc_attr($item['event_title']); ?>" loading="lazy" />
                        <?php endif; ?>
                        <?php if ($show_booking_link) : ?>
                            <p class="marmouz-actions">
                                <a href="<?php echo esc_url($detail_url); ?>" target="_blank" rel="noopener noreferrer">Voir la fiche booking</a>
                            </p>
                        <?php endif; ?>
                                                <?php if ($show_share) : ?>
                                                        <div class="marmouz-share-row">
                                                                <a class="marmouz-share-btn" href="<?php echo esc_url($whatsapp_url); ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                                                                <a class="marmouz-share-btn" href="<?php echo esc_url($facebook_url); ?>" target="_blank" rel="noopener noreferrer">Facebook</a>
                                                                <a class="marmouz-share-btn" href="<?php echo esc_url($bluesky_url); ?>" target="_blank" rel="noopener noreferrer">Bluesky</a>
                                                                <button type="button" class="marmouz-share-btn marmouz-copy-btn" data-copy-url="<?php echo esc_url($share_url); ?>">Copier lien</button>
                                                        </div>
                                                <?php endif; ?>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
        <?php if ($show_share) : ?>
        <script>
        (function () {
            var root = document.getElementById('<?php echo esc_js($root_id); ?>');
            if (!root) return;
            var copyButtons = root.querySelectorAll('.marmouz-copy-btn');
            copyButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var url = btn.getAttribute('data-copy-url') || '';
                    if (!url) return;

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(url).then(function () {
                            btn.textContent = 'Copie';
                            setTimeout(function () { btn.textContent = 'Copier lien'; }, 1200);
                        });
                    } else {
                        window.prompt('Copiez ce lien :', url);
                    }
                });
            });
        })();
        </script>
        <?php endif; ?>
    <?php

    return ob_get_clean();
}
add_shortcode('marmouz_programmation', 'marmouz_programmation_shortcode');
