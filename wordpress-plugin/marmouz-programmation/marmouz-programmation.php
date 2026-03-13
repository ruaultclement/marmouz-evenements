<?php
/**
 * Plugin Name: Marmouz Programmation
 * Description: Shortcode [marmouz_programmation] pour afficher la programmation depuis booking.laguinguettedesmarmouz.fr.
 * Version: 1.0.0
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
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'marmouz_programmation_enqueue_assets');

function marmouz_programmation_shortcode($atts) {
    $atts = shortcode_atts(
        array(
            'api' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-public',
            'cta_url' => 'https://booking.laguinguettedesmarmouz.fr/',
            'cta_label' => 'Viens te produire a la Guinguette',
            'max' => 0,
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
    if ($max > 0) {
        $items = array_slice($items, 0, $max);
    }

    wp_enqueue_style('marmouz-programmation-style');

    ob_start();
    ?>
    <section class="marmouz-programmation">
        <div class="marmouz-programmation-head">
            <h2>Programmation</h2>
            <a class="marmouz-cta" href="<?php echo esc_url($atts['cta_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($atts['cta_label']); ?></a>
        </div>

        <?php if (empty($items)) : ?>
            <article class="marmouz-card"><p>Aucune date confirmee pour l'instant.</p></article>
        <?php else : ?>
            <div class="marmouz-list">
                <?php foreach ($items as $item) : ?>
                    <article class="marmouz-card">
                        <p class="marmouz-date"><?php echo esc_html($item['date_label']); ?></p>
                        <h3><?php echo esc_html($item['event_title']); ?></h3>
                        <p class="marmouz-subtitle"><?php echo esc_html($item['subtitle']); ?></p>
                        <?php if (!empty($item['location'])) : ?>
                            <p class="marmouz-location"><?php echo esc_html($item['location']); ?></p>
                        <?php endif; ?>
                        <?php if (!empty($item['details'])) : ?>
                            <p class="marmouz-details"><?php echo esc_html($item['details']); ?></p>
                        <?php endif; ?>
                        <?php if (!empty($item['photo_url'])) : ?>
                            <img class="marmouz-photo" src="<?php echo esc_url($item['photo_url']); ?>" alt="<?php echo esc_attr($item['event_title']); ?>" loading="lazy" />
                        <?php endif; ?>
                        <p class="marmouz-actions">
                            <a href="<?php echo esc_url($item['detail_url']); ?>" target="_blank" rel="noopener noreferrer">Voir les details</a>
                        </p>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
    <?php

    return ob_get_clean();
}
add_shortcode('marmouz_programmation', 'marmouz_programmation_shortcode');
